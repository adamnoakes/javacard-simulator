var apdu = require('../javacard/framework/APDU.js');
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
        this.selectedAID = undefined;
        this.appletInstance = undefined;
    },

    /**
     * Process a single APDU command with smartcard
     * @param  {SmartCard} smartcard
     * @param  {Array} buffer
     * @param  {Function} cb;
     */
    process: function(smartcard, buffer, cb){
        var cla = buffer[0];    //@adam class of instruction, category
        var ins = buffer[1];    //@adam instruction
        var p1 = buffer[2];     //@adam parameter 1
        var p2 = buffer[3];     //@adam parameter 2
        var lc = buffer[4];     //@adam length of command data
        var tmpApdu = new apdu.APDU(); //contruct an APDU objects
        apdu.constr(tmpApdu, buffer);
        if(tmpApdu.broken){
            return cb(new Error("Broken APDU"), "0x6F00");
        }

        //Set the APDU object on the first position of the object heap
        smartcard.EEPROM.objectheap[0] = tmpApdu; //maybe object heap should be stored in RAM?

        //Reset variables
        smartcard.RAM.transaction_buffer = [];
        smartcard.processor.transaction_flag = false;
        smartcard.RAM.select_statement_flag = 0;

        //If select applet command
        if (buffer.slice(0,4).join() === [0x00, 0xA4, 0x04, 0x00].join()) {
            return this.selectApplet(smartcard, buffer.slice(5,5+lc), cb);
        } else if(!smartcard.EEPROM.selectedApplet.AID){
          return cb(undefined, '0x6A82');
        }

        //If the selected applet is the installer and an install command has been sent, process by installer module
        if((smartcard.EEPROM.selectedApplet.AID.join() === installer.AID.join()) && (cla == 0x80)){
            return installer.process(smartcard, buffer, cb);
        }
        
        jcvm.process(smartcard, [0], function(err, res){
            if(err){
                cb(err, res);
            } else {
                var output = "";
                var apdu = smartcard.EEPROM.objectheap[0];
                if (apdu.state >= 3) {
                    for (var k = 0; k < apdu._buffer.length ; k++) {
                        if(apdu._buffer[k]){
                            output += util.addX(util.addpad(apdu._buffer[k])) + " ";
                        } else {
                            output += "0x00 ";
                        }
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
            if(smartcard.EEPROM.selectedApplet.AID.join() === installer.AID.join()){
                return cb(undefined, "0x9000");
            }

            for(var j = 0; j < smartcard.EEPROM.selectedApplet.CAP.COMPONENT_Import.count; j++) {
                if(smartcard.EEPROM.selectedApplet.CAP.COMPONENT_Import.packages[j].AID.join() === opcodes.jframework.join()) {
                    eeprom.setHeap(smartcard, 0, 160 + (j*256) + 10);
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
    }

};
