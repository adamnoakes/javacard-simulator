module.exports = {
	//if (!transaction_flag) {//need to fix this later, add transaction flag and asyncState etc.
		    //asyncState = false;
	appendHeap: function(EEPROM, arr) {
        if (arr.constructor === Array) {//aprox 3 times quicker than instance of array
            EEPROM.heap.push.apply(EEPROM.heap, arr);
        } else {
            EEPROM.heap.push(arr);
        }
        //this.heap = value.split(','); //need to check
        //} else {
        //    transaction_buffer.push(value);
        //}
    },

    //api objects?
    appendObjectHeap: function(EEPROM, arr) {
	    //if (!transaction_flag) {//need to fix this later, add transaction flag and asyncState etc.
	        //asyncState = false;
	    if(arr.constructor === Array){//aprox 3 times quicker than instance of array
	        EEPROM.objectheap.push.apply(EEPROM.heap, arr);
	    } else {
	        EEPROM.objectheap.push(arr);
	    }
	        //this.heap = value.split(','); //need to check
	    //} else {
	    //    transaction_buffer.push(value);
	    //}
    },
    setHeapValue = function(EEPROM, pos, value){
        if(pos > EEPROM.heap.length){
            EEPROM.heap[EEPROM.heap.length] = value;
        } else{
            EEPROM.heap[pos] = value;
        }
    },
    getAppletCAP: function(EEPROM, appletAID){
        for(var i = 0; i<EEPROM.packages.length; i++){
            for(var j = 0; j<EEPROM.packages[i].COMPONENT_Applet.applets.length; i++){
                if(EEPROM.packages[i].COMPONENT_Applet.applets[j].AID.join() === appletAID.join()){
                    return EEPROM.packages[i];
                }
            }
        }
        return undefined;
    },
    setSelectedApplet: function(EEPROM, appletAID){
        for(var i = 0; i<EEPROM.installedApplets.length; i++){
            if(EEPROM.installedApplets[i].AID.join() === appletAID.join()) {
                EEPROM.selectedApplet.AID =  EEPROM.installedApplets[i].AID;
                EEPROM.selectedApplet.appletRef = EEPROM.installedApplets[i].appletRef;
                EEPROM.selectedApplet.CAP = getAppletCAP(EEPROM, appletAID);
                return true;
            }
        }
        return false;
    },
    getHeapValue: function(EEPROM, value){
        return EEPROM.heap[value];
    },
    getHeapSize: function(EEPROM){
		return EEPROM.heap.length;
	},
	writePackage: function(EEPROM, capfile){
		EEPROM.packages[EEPROM.packages.length] = capfile;
	},
	getPackageByIndex: function(EEPROM, index){
		return EEPROM.packages[index];
	},
	getPackage: function(EEPROM, AID){
        console.log("Given Package: ");
        console.log(AID);
        console.log(EEPROM.packages.length);
        EEPROM.packages[0].COMPONENT_Header.AID.join() 
        AID.join();
        //return this.packages[0];
        //return false;
        //find the package with given AID and return it.
        for(var i = 0; i < 1; i++){
            if(EEPROM.packages[0].COMPONENT_Header.AID.join() === AID.join()){
                return EEPROM.packages[0];
            }
        }
    }
}