/*!
 * instruction-functions
 *
 * Contains the code for complex jcvm instructions to reduce the size
 * of the switch statment.
 *
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */

var ram = require('../smartcard/ram.js');
var eeprom = require('../smartcard/eeprom.js');
var mnemonics = require('../utilities/mnemonics.js');
var api = require('./api.js');
var utilities = require('../utilities/utilities.js');

/**
 * Module exports.
 * @public
 */

module.exports = {
	/**
	 * Load value of type x from Array.
	 * Called by a/b/s/iload.
	 *
	 * @param  {SmartCard} smartcard
	 * @param  {Array}     operandStack
	 * @return Type depends on instruction that called function.
	 */
	xaload: function(smartcard, operandStack){
	    var index = operandStack.pop();
	    var arref = operandStack.pop();
	    return loadArray(smartcard, arref)[index];
	},

	istore: function(operandStack, localVariables, index){
	    var v2 = operandStack.pop();
	    var v1 = operandStack.pop();
	    localVariables[index] = (v1 * mnemonics.short_s + v2) % mnemonics.int_s;
	},

	xastore: function(smartcard, operandStack){
	    var value = operandStack.pop();
	    var index = operandStack.pop();
	    var arref = operandStack.pop();
	    loadArray(smartcard, arref)[index] = value;
	},

	iastore: function(smartcard, operandStack){
	    var v2 = operandStack.pop();
	    var v1 = operandStack.pop();
		var index = operandStack.pop();
		var arref = operandStack.pop();

		loadArray(smartcard, arref)[index] = (v1 << 8) + v2;
	},

	dupX: function(operandStack, x){
	    var m = parseInt(pad(x.toString(16)).slice(0, 1), 16);
	    var n = parseInt(pad(x.toString(16)).slice(1), 16);
	    var ar = [];
	    var j;
	    if (n === 0) {
	        for (j = 0; j < m; j++) {
	            ar.push(operandStack.pop());
	        }
	    } else {
	        for (j = 0; j < n; j++) {
	            ar.push(operandStack.pop());
	        }
	    }
	    for (j = m - 1; j >= 0; j--) {
	        operandStack.push(ar[j]);
	    }
	    for (j = n - 1; j >= 0; j--) {
	        operandStack.push(ar[j]);
	    }
	},

	swapX: function(operandStack, x){
	    var m = parseInt(x.slice(0, 1), 16);
	    var n = parseInt(x.slice(1), 16);
	    var arM = [];
	    var arN = [];
	    var j;
	    for (j = 0; j < m; j++) {
	        arM.push(operandStack.pop());
	    }
	    for (j = 0; j < n; j++) {
	        arN.push(operandStack.pop());
	    }
	    for (j = 0; j < n; j++) {
	        operandStack.push(arN.pop());
	    }
	    for (j = 0; j < m; j++) {
	        operandStack.push(arM.pop());
	    }
	},

	stableswitch: function(operandStack, opcodes, i){
	    //stableswitch, defaultbyte1, defaultbyte2, lowbyte1, lowbyte2,
	    //highbyte1, highbyte2, jump offsets...
	    var defaultbyte = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
	    var low = utilities.shortToValue((opcodes[i + 3] << 8) + opcodes[i + 4]);
	    var high = utilities.shortToValue((opcodes[i + 5] << 8) + opcodes[i + 6]);
	    var arrsize = high - low + 1;
	    var jumptable = [];
	    var index = utilities.shortToValue(operandStack.pop());
	    for (var j = 0; j < arrsize; j++) {
	        jumptable[j] = utilities.shortToValue((opcodes[i + 2 * j + 7] << 8) + opcodes[i + 2 * j + 8]);
	    }
	    if ((index < low) || (index > high)) {
	        return defaultbyte;
	    } else {
	        return jumptable[index - low];
	    }
	},

	itableswitch: function(operandStack, opcodes, i){
	    //itableswitch, defaultbyte1, defaultbyte2, lowbyte1, lowbyte2, lowbyte3, lowbyte4,
	    //highbyte1, highbyte2, highbyte3, highbyte4, jump offsets...
	    var defaultbyte = utilities.shortToValue((opcodes[i + 1] + opcodes[i + 2], 16));
	    var low = utilities.intToValue((opcodes[i + 3] << 24) + (opcodes[i + 4] << 16) + (opcodes[i + 5] << 8) + opcodes[i + 6]);
	    var high = utilities.intToValue((opcodes[i + 7] << 24) + (opcodes[i + 8] << 16) + (opcodes[i + 9] << 8) + opcodes[i + 10]);
	    var arrsize = high - low + 1;
	    var jumptable = [];
	    var index2 = operandStack.pop();
	    var index = operandStack.pop();

	    index = utilities.intToValue(index * mnemonics.short_s + index2);
	    for (var j = 0; j < arrsize; j++) {
	        jumptable[j] = utilities.shortToValue((opcodes[i + 2 * j + 11] << 8) + opcodes[i + 2 * j + 12]);
	    }

	    if ((index < low) || (index > high)) {
	        return defaultbyte;
	    } else {
	        return jumptable[index - low];
	    }
	},

	slookupswitch: function(operandStack, opcodes, i){
	    //slookupswitch, defaultbyte1, defaultbyte2, npairs1, npairs2,
	    //match-offset pairs...
	    var key = utilities.shortToValue(operandStack.pop());
	    var defaultbyte = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
	    var npairs = (opcodes[i + 3] << 8) + opcodes[i + 4];

	    for (var j = 0; j < npairs; j++) {
	        if (utilities.shortToValue((opcodes[i + 4 * j + 5] << 8) + opcodes[i + 4 * j + 6]) == key) {
	            return utilities.shortToValue((opcodes[i + 4 * j + 7] << 8) + opcodes[i + 4 * j + 8]);
	        }
	    }
	    return defaultbyte;
	},

	ilookupswitch: function(operandStack, opcodes, i){
	    //this code has errors?
	    //ilookupswitch, defaultbyte1, defaultbyte2, npairs1, npairs2,
	    //match-offset pairs...
	    var key2 = operandStack.pop();
	    var key = operandStack.pop();
	    var defaultbyte = utilities.shortToValue((opcodes[i + 1] << 8) + opcodes[i + 2]);
	    var npairs = (opcodes[i + 3] << 8) + opcodes[i + 4];
	    key = utilities.intToValue(key * mnemonics.short_s + key2);
	    for (var j = 0; j < npairs; j++) {
	        if (utilities.intToValue((opcodes[i + 6 * j + 5] << 24) + (opcodes[i + 6 * j + 6] << 16) + (opcodes[i + 6 * j + 7] << 8) + opcodes[i + 6 * j + 8]) == key) {
	            return utilities.shortToValue((opcodes[i + 6 * j + 9] << 8) + opcodes[i + 6 * j + 10]);
	        }
	    }
	    return defaultbyte;
	},

	//robin modified by adam
	getstatic: function(constantPool, parameters, size) {
	    var info = constantPool[(parameters[0] << 8) + parameters[1]].info.slice(0);
	    var barr = [];
	    var offset = (info[1] << 8) + info[2];
	    var sf = readStaticField().split(',');
	    for (var j = 0; j < size; j++) {
	        barr[j] = sf[offset + j];
	    }
	    return utilities.convertFromBytes(barr);
	},

	putstatic: function(constantPool, parameters, val, size) {
	    var info = constantPool[(parameters[0] << 8) + parameters[1]].info.slice(0);
	    var barr = utilities.convertToBytes(val, size);
	    var offset = (info[1] << 8) + info[2];
	    var sf = readStaticField().split(',');
	    var j;
	    for (j = 0; j < size; j++) {
	        sf[offset + j] = barr[j];
	    }

	    var opstr = '';
	    for (j = 0; j < sf.length - 1; j++) {
	        opstr += sf[j] + ',';
	    }
	    writeStaticField(opstr);
	},

	invokevirtualExternal: function(smartcard, capFile, heap, operandStack, params){
		var param0 = params[0] - 128;
		var packageAID = capFile.COMPONENT_Import.packages[param0].AID;
		var numOfArgs = api.getNumberOfArguments(packageAID, params[1], params[2], 3);
		var args = [];
		var found = false;

		if(numOfArgs > 0) {
			args = operandStack.slice(-numOfArgs);
			loadAnyArrays(smartcard, args);
			operandStack.length = operandStack.length - numOfArgs;
		}

	    var object = operandStack.pop();

	    if(!(object instanceof Object)){
	    	var ocls = heap[object];
	    	var clssig = ((param0 << 8) + params[1]);

	        while (!found) {
	            if (160 + clssig == ocls) {
	                found = true;
	                object++;
	            } else {
	                for (var j = 0; j < capFile.COMPONENT_Class.i_count; j++) {
	                    if (capFile.COMPONENT_Class.interface_info[j].start == ocls) {
	                        object += capFile.COMPONENT_Class.interface_info[j].declared_instance_size + 1;
	                        ocls = heap[object];
	                        break;
	                    }
	                }
	            }
	        }

	        object = eeprom.getObjectHeapValue(smartcard.EEPROM, heap[object]);
	    }
	    var apiresult = api.run(packageAID, params[1], params[2], 3, args, object, smartcard);

	    if(apiresult instanceof Error){
	        return apiresult;
	    } else if (apiresult !== undefined){//if not void
	        if(apiresult.constructor === Array){//if array
	            operandStack.push("#H" + heap.length);
				heap.push(apiresult);
	        } else if(!apiresult.type) {//if it doesn't have a type, i.e it's not transient
	            operandStack.push(apiresult);
	        } else {
	            //Transient Array
	            //do nothing
	        }
	    }
	},

	invokevirtualInternal: function(capFile, opcodes, operandStack, frames, params){
		var newFrameRef = frames.length;
		var index;
		var Frame = require('./jcvm.js').Frame;
        frames[newFrameRef] = new Frame();

		var clssig = ((params[0] << 8) + params[1]);
		for (var j = 0; j < capFile.COMPONENT_Class.i_count; j++) {
	        if (capFile.COMPONENT_Class.interface_info[j].start == clssig) {
	            index = j;
	            break;
	        }
	    }
	    var offset = getMethodOffset(capFile, params[2], index);
	    var numOfArgs;
	    //Method component
	    if (opcodes[offset] > 127) {
	        numOfArgs = opcodes[offset + 2];
	        offset += 4;
	    } else {
	        numOfArgs = parseInt(utilities.pad(opcodes[offset + 1].toString(16)).slice(0, 1), 16);
	        offset += 2;
	    }

	    frames[newFrameRef].local_vars = operandStack.slice(-(numOfArgs));
        operandStack.length = operandStack.length - (numOfArgs -1);
		return offset;
	},

	invokespecialExternal: function(smartcard, capFile, heap, operandStack, params){
		var param0 = params[0] - 128;
		var packageAID = capFile.COMPONENT_Import.packages[param0].AID;
		var numOfArgs = api.getNumberOfArguments(packageAID, params[1], params[2], 6);
		var args = [];
		var found = false;

		if(numOfArgs > 0){
			args = operandStack.slice(- numOfArgs);
			loadAnyArrays(smartcard, args);
			operandStack.length = operandStack.length - numOfArgs;
		}

	    var object = operandStack.pop();
	    if(!(object instanceof Object)){
	    	var ocls = heap[object];
	    	var clssig = ((param0 << 8) + params[1]);
	    	while (!found) {
                if (160 + clssig == ocls) {//clssig + 160 changed from A + clssig
                    found = true;
                    object++;
                } else {
                    for (var j = 0; j < capFile.COMPONENT_Class.i_count; j++) {
                        if (capFile.COMPONENT_Class.interface_info[j].start === ocls) {
                            object += capFile.COMPONENT_Class.interface_info[j].declared_instance_size + 1;
                            ocls = heap[object];
                            break;
                        }
                    }
                }
            }

            object = eeprom.getObjectHeapValue(smartcard.EEPROM, heap[object]);
	    }
	    var apiresult = api.run(packageAID, params[1], params[2], 6, args, object, smartcard);
	    if(apiresult instanceof Error){
            return apiresult;
        } else if (apiresult !== undefined){//if not void
	        if(apiresult.constructor === Array){//if array
	        	operandStack.push("#H" + heap.length);
	            heap.push(apiresult);
	        } else if(!apiresult.type) {//if it doesn't have a type, i.e it's not transient
	            operandStack.push(apiresult);
	        } else {
	            //Transient Array
	            //do nothing
	        }
	    }
	},
	invokespecialInternal: function(opcodes, operandStack, frames, params){
		var offset = (params[1] << 8) + params[2] - 1;
		var numOfArgs;
		var newFrame = frames.length;
		var Frame = require('./jcvm.js').Frame;
        frames[newFrame] = new Frame();

		//Method component
        if (opcodes[offset] > 127) {
			numOfArgs = opcodes[offset + 2];
            offset += 4;
        } else {
			numOfArgs = parseInt(utilities.pad(opcodes[offset + 1].toString(16)).slice(0, 1), 16);
            offset += 2;
        }

        frames[newFrame].local_vars = operandStack.slice(-(numOfArgs));
        operandStack.length = operandStack.length - (numOfArgs -1);

        return offset;
	},
	invokestaticExternal: function(smartcard, capFile, heap, operandStack, params){
		var param0 = params[0] - 128;
		var packageAID = capFile.COMPONENT_Import.packages[param0].AID;
		var numOfArgs = api.getNumberOfArguments(packageAID, params[1], params[2], 6);
		var args = [];
		if(numOfArgs > 0) {
			args = operandStack.slice(-numOfArgs);
			loadAnyArrays(smartcard, args);
			operandStack.length = operandStack.length - numOfArgs;
		}

	    var apiresult = api.run(packageAID, params[1], params[2], 6, args, null, smartcard);

	    if(apiresult instanceof Error){
            return apiresult;
        } else if (apiresult !== undefined){//if not void
	        if(apiresult.constructor === Array){//if array
	        	operandStack.push("#H" + heap.length);
	            heap.push(apiresult);
	        } else if(!apiresult.transientArray) {//if it doesn't have a type, i.e it's not transient
	            operandStack.push(apiresult);
	        } else {
	            //New Transient Array
                operandStack.push("T" + ram.getTransientData(smartcard.RAM).length + "#" + apiresult.array.length + "#" + args[1]);
                ram.pushTransientData(smartcard.RAM, apiresult.array);
	        }
	    }
	},
	invokeinterface: function(smartcard, capFile, operandStack, classRef, methodToken, numOfArgs){
        var packageAID = capFile.COMPONENT_Import.packages[(classRef[0] >= 128 ? classRef[0] - 128 : classRef[0])].AID;
        var classToken = classRef[1];
        var typeToken = classRef[2];
        //var class_offset = (info[0] << 8) + info[1];
        var args = operandStack.slice(-(numOfArgs-1));
        loadAnyArrays(smartcard, args);
        operandStack.length = operandStack.length - (numOfArgs -1);
        var object = operandStack.pop();

		api.run(packageAID, classToken, methodToken, typeToken, args, object, null, smartcard);
	},
	new_v: function(){

	}
};

/**
 * Private functions.
 */

function getMethodOffset(capFile, param, index){
	var tblindex;
    if (param < 128) {
        tblindex = param - capFile.COMPONENT_Class.interface_info[index].public_method_table_base;
        return capFile.COMPONENT_Class.interface_info[index].public_virtual_method_table[tblindex] - 1;
    } else {
        param -= 128;
        tblindex = param - capFile.COMPONENT_Class.interface_info[index].package_method_table_base;
        return capFile.COMPONENT_Class.interface_info[index].package_virtual_method_table[tblindex] - 1;
    }
}

function loadArray(smartcard, parameter){
    var references;
    if(typeof parameter == 'string' ||
        parameter instanceof String){
        if (parameter.toString().slice(0, 2) == "#H") {
            references = parameter.split('#H');
            return smartcard.RAM.heap[Number(references[1])];//TODO --> remove refernce to smartcard, replace with heap
        } else if (parameter.toString().slice(0, 1) == "T"){
            references = parameter.slice(1).split("#");
            if(smartcard.RAM.transient_data[Number(references[0])] === undefined){
                smartcard.RAM.transient_data[Number(references[0])] = [];
            }
            return smartcard.RAM.transient_data[Number(references[0])];
        }
    }
    return parameter;
}

function loadAnyArrays(smartcard, parameters){
    for(var i = 0; i< parameters.length; i++){
        parameters[i] = loadArray(smartcard, parameters[i]);
    }
}
