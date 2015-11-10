function EEPROM(RAM) {
    this.RAM = RAM; //TODO --> These functions should be called by processor which modifies EEPROM, and no RAM in here.
	this.heap = [0xA0,0x00];
	this.packages = [];
    this.installedApplets = [{'AID': [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01], 'appletRef': -1}];
    this.selectedApplet = {'AID': undefined, 'appletRef': undefined, 'CAP': undefined};
    this.objectheap = [];
		//if (!transaction_flag) {//need to fix this later, add transaction flag and asyncState etc.
		    //asyncState = false;
    this.appendHeap = function(arr) {
        if (arr.constructor === Array) {//aprox 3 times quicker than instance of array
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

    this.setSelectedApplet = function(appletAID){
        for(var i = 0; i<this.installedApplets.length; i++){
            if(this.installedApplets[i].AID.join() === appletAID.join()) {
                this.selectedApplet.AID =  this.installedApplets[i].AID;
                this.selectedApplet.appletRef = this.installedApplets[i].appletRef;
                this.selectedApplet.CAP = this.getAppletCAP(appletAID);
                return true;
            }
        }
        return false;
    }

    this.getAppletCAP = function(appletAID){
        for(var i = 0; i<this.packages.length; i++){
            for(var j = 0; j<this.packages[i].COMPONENT_Applet.applets.length; i++){
                if(this.packages[i].COMPONENT_Applet.applets[j].AID.join() === appletAID.join()){
                    return this.packages[i];
                }
            }
        }
        return undefined;
    }

    this.addInstalledApplet = function(){
        this.installedApplets.push({'AID': this.RAM.installingAppletAID, 'appletRef': this.RAM.gRef});
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