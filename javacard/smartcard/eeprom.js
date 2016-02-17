module.exports = {
    /**
     * Represents a smart cards EEPROM memory
     * @param {string} cardName
     */
    EEPROM: function(cardName) {
        this.cardName = cardName;
        this.heap = [0xA0,0x00]; //should probably be in processor or ram?
        this.packages = [];
        this.installedApplets = [{'AID': [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01], 'appletRef': -1}];
        this.selectedApplet = {'AID': undefined, 'appletRef': undefined, 'CAP': undefined};
        this.objectheap = [];
    },
	//if (!transaction_flag) {//need to fix this later, add transaction flag and asyncState etc.
		    //asyncState = false;
    /**
     * @param  {EEPROM} EEPROM
     * @return {string}
     */
    getCardName: function(EEPROM){
        return EEPROM.cardName;
    },
    /**
     * Pushes an item, or array of items onto the heap. item?
     * @param  {EEPROM} EEPROM
     * @param  {array/item} arr
     */
	appendHeap: function(EEPROM, arr) {
        //aprox 3 times quicker than instance of array
        if (arr.constructor === Array) {
            //EEPROM.heap.push.apply(EEPROM.heap, arr);
            EEPROM.heap.push(arr);
        } else {
            EEPROM.heap.push(arr);
        }
        //this.heap = value.split(','); //need to check
        //} else {
        //    transaction_buffer.push(value);
        //}
    },

    /**
     * Pushes an object, or array of objects onto the object heap.
     * @param  {EEPROM} EEPROM
     * @param  {array/object} arr
     */
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
    setHeapValue: function(EEPROM, pos, value){
        if(pos > EEPROM.heap.length){
            EEPROM.heap[EEPROM.heap.length] = value;
        } else{
            EEPROM.heap[pos] = value;
        }
    },
    getAppletCAP: function(EEPROM, appletAID){
        for(var i = 0; i<EEPROM.packages.length; i++){
            for(var j = 0; j<EEPROM.packages[i].COMPONENT_Applet.applets.length; j++){
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
                EEPROM.selectedApplet.CAP = this.getAppletCAP(EEPROM, appletAID);
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
        //find the package with given AID and return it.
        for(var i = 0; i < EEPROM.packages.length; i++){
            if(EEPROM.packages[i].COMPONENT_Header.AID.join() === AID.join()){
                return EEPROM.packages[i];
            }
        }
    },

    addInstalledApplet: function(EEPROM, appletAID, gRef){
        EEPROM.installedApplets.push({'AID': appletAID, 'appletRef': gRef});
    },

    getObjectHeap: function(EEPROM){ return EEPROM.objectheap;},
    getObjectHeapValue: function(EEPROM, ref){ return EEPROM.objectheap[ref];}
}