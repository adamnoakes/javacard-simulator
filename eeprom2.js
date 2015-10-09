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
	this.heap = [];
	this.packages = [];
	this.appletInstances = [];  //array of type appletInstance
	this.packageApplets = []; //array of type appletInstance
	this.packageTables = []; //array of type packageItem
	this.newHeap = function(value) {
		if (!transaction_flag) {
		    asyncState = false;
		    //PageMethods.newHeap(gcardname, value, HeapRes);
		    this.heap = value.split(','); //need to check
		} else {
		    transaction_buffer.push(value);
		}
	}
}

function APISave(lineno, value) {
    
    PageMethods.APISave(gcardname, lineno, value); // objectheap.length
}


function newAPIObject(lib,cls) {
   
    var obj;
    switch (lib) {
        case jframework:

            switch (cls) {
                case 3:
                    obj = new Applet();
                    break;
                case 6:
                    obj = new AID();
                    break;
                case 9:
                    obj = new OwnerPIN();
                    break;
                case 10:
                    obj = new APDU();
                    break;
                default:
                    break;
            }
            break;
        case jlang:
            switch (cls) {
                case 0:
                    obj = new Object();
                    break;
                case 1:
                    obj = new Throwable();
                    break;
                case 2:
                    obj = new Exception();
                    break;
                case 3:
                    obj = new RuntimeException();
                    break;
                case 4:
                    obj = new IndexOutOfBoundsException();
                    break;
                case 5:
                    obj = new ArrayIndexOutOfBoundsException();
                    break;
                case 6:
                    obj = new NegativeArraySizeException();
                    break;
                case 7:
                    obj = new NullPointerException();
                    break;
                case 8:
                    obj = new ClassCastException();
                    break;
                case 9:
                    obj = new ArithmeticException();
                    break;
                case 10:
                    obj = new SecurityException();
                    break;
                case 11:
                    obj = new ArrayStoreException();
                    break;

            }
            break;
        case jsecurity:


            break;
        case jxcrypto:


            break;
        default:
    }
    APISave(objectheap.length, obj.save());
    objectheap.push(obj);
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