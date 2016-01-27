var installer = require('./installer.js');
var apduJS = require('./java.framework/APDU.js');
var jcvm = require('./jcvm.js');
var opcodes = require('./opcodes.js');
var eepromJS = require('./eeprom.js');
var ramJS = require('./ram.js');

function Processor(RAM, EEPROM){
    this.RAM = new ramJS.RAM();
    this.EEPROM = new eepromJS.EEPROM();
	this.response = undefined;
    this.buffer = [];
	this.CLA = undefined;
	this.INS = undefined;
	this.P1 = undefined;
	this.P2 = undefined;
	this.LC = undefined;
	this.apdu = undefined;
	this.selectedAID = undefined;
	this.appletInstance = undefined;
	this.installerAID = [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01];//merge into installer
	//this.installer = new installJS.Installer(this);//Should this be moved down? --> YES when select install applet, just realised it messed up probably due to installer boolean down there \/
}
	

	

    /* 
     *  JCVM Functions  
     */

     Processor.prototype.storeArray = function(arref, index, value) {
        if (arref == null) { jcvm.executeBytecode.exception_handler(jlang, 7, ""); }
        if (arref.toString().slice(0, 1) == "H") {
            var ref = arref.slice(1).split("#");
            var obj = this.getObjectHeap()[Number(ref[0])];
            if ((index >= Number(ref[2])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                obj.setArray(Number(ref[1]), index, value);
                //APISave(ref[0], obj.save());
            }
        } else if (arref.toString().slice(0, 1) == "T") {
            var ref = arref.slice(1).split("#");
            var tpsn = Number(ref[0])
            if ((index >= Number(ref[1]))|| (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                this.RAM.transient_data[tpsn + index] = value;
            }
          } else {

            arref = Number(arref);
            index = Number(index);
            if ((index >= this.getHeapValue(arref)) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                this.setHeapValue(arref + index + 1, value);
            };
        }
     }

     Processor.prototype.loadArray = function(arref, index) {
        var out;
        if (arref == null) { jcvm.executeBytecode.exception_handler(jlang, 7, ""); }
        if (arref.toString().slice(0, 1) == "H") {
            var ref = arref.slice(1).split("#");
            if ((index >= Number(ref[2])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {

                var obj = this.getObjectHeap()[Number(ref[0])];
                out = obj.getArray(Number(ref[1]), index);
     
            }
        } else if (arref.toString().slice(0, 1) == "T") {
            var ref = arref.slice(1).split("#");
            var tpsn = Number(ref[0]);
            if ((index >= Number(ref[1])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                out = this.RAM.transient_data[tpsn + index];
            } 
        } else {
            arref = Number(arref);
            index = Number(index);
            if ((index >= this.getHeapValue(arref)) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else { out = this.getHeapValue(arref + index + 1); }
        }
        return out;
    };

    /* 
     *  JCSystem Functions  
     */
     Processor.prototype.abortTransaction = function () {

        if (!this.RAM.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 2); }
        else {
            this.RAM.transaction_flag = false;
            this.RAM.transaction_buffer = [];
        }
        
        return;
    };//00
    Processor.prototype.beginTransaction = function () {
        if (this.RAM.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 1); }
        else { this.RAM.transaction_flag = true; }

        return;
    };//01
    Processor.prototype.commitTransaction = function () {//TODO --> Execution handler convert to hex array for jframework
        if (!this.RAM.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 2); }
        else {
            this.RAM.transaction_flag = false;
            var len = this.RAM.transaction_buffer.length;
            for (var j = 0; j < len; j++) {
                var spl = this.RAM.transaction_buffer[j].split(";");//why split on ;
                if (spl.length == 1) {
                    this.EEPROM.newHeap(spl[0]);
                } else {
                    this.EEPROM.setHeap(Number(spl[0]), Number(spl[1]));
                }
                
            }
            this.RAM.transaction_buffer = [];
        }

        return;
    };//02

    /* 
     *  EEPROM Functions  
     */
    Processor.prototype.addInstalledApplet = function(){
        this.EEPROM.installedApplets.push({'AID': this.RAM.installingAppletAID, 'appletRef': this.RAM.gRef});
    };

    Processor.prototype.getObjectHeap = function(){ return this.EEPROM.objectheap;};

    Processor.prototype.appendHeap = function(arr){this.EEPROM.appendHeap(arr);};
    Processor.prototype.appendObjectHeap = function(arr){this.EEPROM.appendObjectHeap(arr);};
    Processor.prototype.setHeapValue = function(pos, value){this.EEPROM.setHeapValue(pos, value);};
    Processor.prototype.setSelectedApplet = function(appletAID){this.EEPROM.setSelectedApplet(appletAID);};
    Processor.prototype.getAppletCAP = function(appletAID){return this.EEPROM.getAppletCAP(appletAID);};
    Processor.prototype.getHeapValue = function(value){return this.EEPROM.getHeapValue(value);};
    Processor.prototype.getHeapSize = function(){return this.EEPROM.getHeapSize();};
    Processor.prototype.writePackage = function(capfile){this.EEPROM.writePackage(capfile);};
    Processor.prototype.getPackageByIndex = function(index){return this.EEPROM.getPackageByIndex(index);};
    Processor.prototype.getPackage = function(AID){return this.EEPROM.getPackage(AID);};

    /* 
     *  RAM Functions  
     */
    Processor.prototype.getTransientData = function(){return this.RAM.transient_data;};
    Processor.prototype.pushTransientData = function(val){this.RAM.transient_data.push(val);};
    Processor.prototype.setGRef = function(val){this.RAM.gRef = val;};
    Processor.prototype.getSelectStatementFlag = function(){return this.RAM.select_statement_flag;};
    Processor.prototype.setInstallingAppletAID = function(aid){this.RAM.installingAppletAID = aid;};
    Processor.prototype.setCurrentComponent = function(val){this.RAM.currentComponent = val;};
    Processor.prototype.getCurrentComponent = function(){return this.RAM.currentComponent;};
    Processor.prototype.getTempComponents = function(){return this.RAM.tempComponents;};
    Processor.prototype.getTempComponent = function(pos){return this.RAM.tempComponents[pos];};
    Processor.prototype.setTempComponent = function(pos, val){this.RAM.tempComponents[pos] = val;};
    Processor.prototype.resetTempComponents = function(){this.RAM.tempComponents = [];};
    Processor.prototype.getCardName = function(){return this.EEPROM.cardName;};


    

function addpad(d) {
    var hex = Number(d).toString(16);

    while (hex.length < 2) {
        hex = "0" + hex;
    }

    return hex; //"0x" +
}

function addX(d) { return "0x" + d;}

exports.Processor = Processor;