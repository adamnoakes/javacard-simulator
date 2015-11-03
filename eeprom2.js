//change to hashmaps
function appletInstance(parentPackageIndex, AID, addressPointer){
	this.parentPackageIndex = parentPackageIndex;
	this.AID = AID;
	this.addressPointer = addressPointer;
}

function packageAppletInstance(parentPackageIndex, AID, addressPointer){
	this.parentPackageIndex = parentPackageIndex;
	this.AID = AID;
	this.addressPointer = addressPointer;
}

function packageItem(packageIndex, AID){
	this.packageIndex = packageIndex;
	this.AID = AID;
}

function EEPROM() { 
	this.heap = [0xA0,0x00];
	this.packages = [];
    this.objectheap = [];
	this.appletInstances = [];  //array of type appletInstance
	this.packageApplets = []; //array of type appletInstance
	this.packageTables = []; //array of type packageItem
	this.appendHeap = function(arr) {
		//if (!transaction_flag) {//need to fix this later, add transaction flag and asyncState etc.
		    //asyncState = false;
            if(arr.constructor === Array){//aprox 3 times quicker than instance of array
                this.heap.push.apply(this.heap, arr);
            } else {
                this.heap.push(arr);
            }
		    //this.heap = value.split(','); //need to check
		//} else {
		//    transaction_buffer.push(value);
		//}
	}
    //api objects?
    this.appendObjectHeap = function(arr) {
        //if (!transaction_flag) {//need to fix this later, add transaction flag and asyncState etc.
            //asyncState = false;
            if(arr.constructor === Array){//aprox 3 times quicker than instance of array
                this.objectheap.push.apply(this.heap, arr);
            } else {
                this.objectheap.push(arr);
            }
            //this.heap = value.split(','); //need to check
        //} else {
        //    transaction_buffer.push(value);
        //}
    }

    this.setHeapValue = function(pos, value){
        if(pos > this.heap.length){
            this.heap[this.heap.length] = value;
        } else{
            this.heap[pos] = value;
        }
    }

    this.getHeapValue = function(value){
        return this.heap[value];
    }

	this.getHeapSize = function(){
		return this.heap.length;
	}
	this.writePackage = function(capfile){
		this.packages[this.packages.length] = capfile;
	}
	this.getPackageByIndex = function(index){
		return this.packages[index];
	}

    this.getPackage = function(AID){
        console.log("Given Package: ");
        console.log(AID);
        console.log(this.packages.length);
        this.packages[0].COMPONENT_Header.AID.join() 
        AID.join();
        //return this.packages[0];
        //return false;
        //find the package with given AID and return it.
        for(var i = 0; i < 1; i++){
            if(this.packages[0].COMPONENT_Header.AID.join() === AID.join()){
                return this.packages[0];
            }
        }
    }
}

function APISave(lineno, value) {
    
    PageMethods.APISave(gcardname, lineno, value); // objectheap.length
}


function newStaticField(pk,val) {

    PageMethods.writeStaticField(gcardname, pk, val);
}

function writeStaticField(val) {

    PageMethods.writeStaticField(gcardname, gpID, val);
}

function readStaticField() {

    PageMethods.readStaticField(gcardname, gpID, HeapRes);

    return HeapResult;

}

function cAppInstance(val1, val2) {
    
    PageMethods.cAppInstance(gcardname, val1, val2, gRef, HeapRes);
    if (!HeapResult) { ISOException.throwIt(0x6444); } else { installed_flag = true; };
 
}

function ResetTransientData(typeval, EEPROM) {
    
    
    //PageMethods.GetEEPROM(gcardname, HeapRes);

    var EP = EEPROM.heap;
    var len = EP.length;
    var tcount = 0;

    for (j = 0; j < len; j++) {
        if (EP[j].slice(0, 1) == "T") {
            var val = (EP[j].slice(1)).split("#");
            if ((typeval == 1) || (typeval == val[2])) {
                for (var k = 0; k < val[1]; k++) { transient_data[tcount + k] = 0; }
            }
            tcount += Number(val[1]);
        }
    }
}

function Recover() {

    var savestr = [];

    function vRes(bResult) {
        savestr = bResult;
    }

    Recover.BackupAll = function () {

        PageMethods.BackupAll(gcardname, gpID, vRes);
    }

    Recover.RecoverAll = function() {
        PageMethods.RecoverAll(gcardname, gpID, savestr);
        transaction_buffer = [];
        transaction_flag = false;
        APIs.loadAPIs();
    }

}


exports.EEPROM = EEPROM;
exports.appletInstance = appletInstance;