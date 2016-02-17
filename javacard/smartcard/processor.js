var apdu = require('../framework/APDU.js');
var eeprom = require('./eeprom.js');
var installer = require('./installer.js');
var opcodes = require('../utilities/opcodes.js');
var jcvm = require('../jcre/jcvm.js');
var cap = require('./cap.js');
var util = require('../utilities/utilities.js');

module.exports = {
    /**
     * Processor object contructor
     * @constructor
     */
    Processor: function(){
        this.response = undefined;
        this.buffer = [];
        this.transaction_flag = false;
        this.CLA = undefined;
        this.INS = undefined;
        this.P1 = undefined;
        this.P2 = undefined;
        this.LC = undefined;
        this.apdu = undefined;
        this.selectedAID = undefined;
        this.appletInstance = undefined;
        this.installerAID = [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01];//merge into installer module
        //this.installer = new installJS.Installer(this);//Should this be moved down? --> YES when select install applet, just realised it messed up probably due to installer boolean down there \/
    },

    /**
     * Process a single APDU command with smartcard
     * @param  {SmartCard} smartcard
     * @param  {Array} buffer
     * @param  {Function} cb;
     */
    process: function(smartcard, buffer, cb){
        //contruct an APDU objects
        smartcard.processor.apdu = new apdu.APDU();
        apdu.constr(smartcard.processor.apdu, buffer);
        if(smartcard.processor.apdu.broken){
            return cb(new Error("Broken APDU"), "0x6F00");
        }
        //Set the APDU object on the first position of the object heap
        smartcard.EEPROM.objectheap[0] = smartcard.processor.apdu; //maybe object heap should be stored in RAM?
        //Reset the processor response message
        smartcard.processor.response = ""; //consider moving to RAM.
        //Reset variables
        smartcard.RAM.asyncState = false; //no idea what this is for
        smartcard.processor.transaction_flag = false; //probably should be stored in the processor? ->done
        smartcard.RAM.transaction_buffer = [];
        smartcard.processor.buffer = buffer; //store buffer for installer
        //Assign APDU values
        smartcard.processor.CLA = buffer[0];    //@adam class of instruction, category
        smartcard.processor.INS = buffer[1];    //@adam instruction
        smartcard.processor.P1 = buffer[2];     //@adam parameter 1
        smartcard.processor.P2 = buffer[3];     //@adam parameter 2
        smartcard.processor.LC = buffer[4];     //@adam length of command data


        //If select applet command
        if ((smartcard.processor.CLA === 0x00) && (smartcard.processor.INS == 0xA4) && (smartcard.processor.P1 == 0x04) && (smartcard.processor.P2 === 0x00)) {
            //Attempt to select the specified applet
            return this.selectApplet(smartcard, buffer.slice(5,5+smartcard.processor.LC), cb);
        } else {
            smartcard.RAM.select_statement_flag = 0;
        }

        //If the selected applet is the installer and an install command has been sent, process by installer module
        if((smartcard.EEPROM.selectedApplet.AID.join() === smartcard.processor.installerAID.join()) && (smartcard.processor.CLA == 0x80)){
            return installer.process(smartcard, cb);
        }

        var params = [];
        params[0] = 0;
        jcvm.process(smartcard, params, function(err, res){
            if(err){
                cb(err, res);
            } else {
                var output = "";
                if (apdu.getCurrentState(smartcard.processor.apdu) >= 3) {
                    //@adam -1 has been added as a quick fix, why the expected length is being outputtted
                    //      should be looked into.
                    for (var k = 0; k < apdu.getBuffer(smartcard.processor.apdu).length; k++) {
                        output += util.addX(util.addpad(apdu.getBuffer(smartcard.processor.apdu)[k])) + " ";
                        //output += this.apdu.getBuffer()[k] + "";
                    }
                }
                cb(undefined, output + res);
            }
        });
    },

    /**
     * Called by process, to select an applet
     * @param  {SmartCard} smartcard
     * @param  {Array} appletAID
     * @param  {Function} cb
     */
    selectApplet: function (smartcard, appletAID, cb){
        smartcard.RAM.transient_data = [];
        smartcard.RAM.select_statement_flag = 1;

        //delect curent applet
        smartcard.processor.selectedAID = []; //not the way to deselect, see code below
        //set applet aid and cap file in eeprom
        if(eeprom.setSelectedApplet(smartcard.EEPROM, appletAID)){
            if(smartcard.EEPROM.selectedApplet.AID.join() === smartcard.processor.installerAID.join()){
                return cb(undefined, "0x9000");
                //return;//if installer then the rest is not necessary
            }

            for(var j = 0; j < smartcard.EEPROM.selectedApplet.CAP.COMPONENT_Import.count; j++) { 
                if(smartcard.EEPROM.selectedApplet.CAP.COMPONENT_Import.packages[j].AID.join() === opcodes.jframework.join()) {
                    eeprom.setHeapValue(smartcard.EEPROM, 0, 160 + (j*256) + 10);
                    break;
                }
            }
            
            var startcode = cap.getStartCode(smartcard.EEPROM.selectedApplet.CAP, appletAID, 6);
            var params = [];

            var processSelect = function(err, res){
                if(err){
                    return cb(new Error(), res);
                }
                params[0] = 0;
                jcvm.process(smartcard, params, function(err, res){
                    if(err) {
                        smartcard.EEPROM.selectedApplet = null;
                        return cb(new Error(), res);
                    }
                    return cb(undefined, res);
                });
            };

            //if the applet has an install method, run it.
            if (startcode > 0) {
                jcvm.selectApplet(smartcard, processSelect);
            } else {
                processSelect();
            }
            
        } else {
            //@adam no applet found
            cb(new Error(), "0x6A82");
        }
    },
    /* 
     *  JCSystem Functions  
     */
    abortTransaction: function (smartcard) {

        if (!smartcard.Processor.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 2); }
        else {
            smartcard.Processor.transaction_flag = false;
            smartcard.RAM.transaction_buffer = [];
        }
        
        return;
    },//00

    beginTransaction: function (smartcard) {
        if (smartcard.Processor.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 1); }
        else { smartcard.Processor.transaction_flag = true; }

        return;
    },//01
    commitTransaction: function (smartcard) {//TODO --> Execution handler convert to hex array for jframework
        if (!smartcard.Processor.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 2); }
        else {
            smartcard.Processor.transaction_flag = false;
            var len = smartcard.RAM.transaction_buffer.length;
            for (var j = 0; j < len; j++) {
                var spl = smartcard.RAM.transaction_buffer[j].split(";");//why split on ;
                if (spl.length == 1) {
                    eeprom.newHeap(smartcard.EEPROM, spl[0]);
                } else {
                    eeprom.setHeap(smartcard.EEPROM, Number(spl[0]), Number(spl[1]));
                }
                
            }
            smartcard.RAM.transaction_buffer = [];
        }
        return;
    }
    //02
};