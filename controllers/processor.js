module.exports = {
    selectApplet: function (smartcard, appletAID){
        smartcard.RAM.transient_data = []; //reset transient data --> instead create new ram?
        smartcard.RAM.select_statement_flag = 1;

        //delect curent applet
        smartcard.processor.selectedAID = []; //not the way to deselect, see code below
        //set applet aid and cap file in eeprom
        if(EEPROMFunctions.setSelectedApplet(smartcard.EEPROM, appletAID)){
            if(smartcard.EEPROM.selectedApplet.AID.join() === smartcard.processor.installerAID.join()){
                return "0x9000"//if installer then the rest is not necessary
            }

            for(var j = 0; j < smartcard.EEPROM.selectedApplet.CAP.COMPONENT_Import.count; j++) { 
                if(smartcard.EEPROM.selectedApplet.CAP.COMPONENT_Import.packages[j].AID.join() === opcodes.jframework.join()) {
                    EEPROMFunctions.setHeapValue(smartcard.EEPROM, 0, 160 + (j*256) + 10);
                    break;
                }
            }
            
            var startcode = CAPFunctions.getStartCode(smartcard.EEPROM.selectedApplet.CAP, appletAID, 6);
            var params = [];

            //if the applet has an install method, run it.
            if (startcode > 0) {
                jcvm.executeBytecode(smartcard.EEPROM.selectedApplet.CAP, startcode, params, 2,
                    smartcard.EEPROM.selectedApplet.appletRef, smartcard);
            }

            //if install method (above) executed sucessfully, start process method
            if(true){
                startcode = CAPFunctions.getStartCode(smartcard.EEPROM.selectedApplet.CAP, appletAID, 7);
                params[0] = 0;
                jcvm.executeBytecode(smartcard.EEPROM.selectedApplet.CAP, startcode, params, 0, smartcard.EEPROM.selectedApplet.appletRef,
                    smartcard);
            }

            if(true){//if the method above fails reset selectapplet
                return "0x9000";
            } else {
                smartcard.EEPROM.selectedApplet = null;
            }
            
        } else {
            return "0x6A82";
        }

        if (appletAID.join() === smartcard.processor.installerAID.join()) {
            smartcard.processor.selectedAID = smartcard.processor.installerAID;
            console.log("installerAID " + smartcard.processor.installerAID + "selectedAID: " + smartcard.processor.selectedAID + ".");
            //create installer applet and send it reference to the EEPROM so that it can program the card :-) <-- didn't work moving that code up to the top
            console.log("E@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            console.log(smartcard.EEPROM);


            //could add help message to return (e.g. selected AID is ...)

            found = true;//TODO --> should probably return here too? instead of keep using response variable.
        } else {
            //TODO convert to integer storage


        }

        if (!found) {
            return "0x6A82"; //@adam no applet found code
        } else {
            return "0x9000"; //@adam 27/01/2016 -> fix this to below 
            //if (this.response == "") { this.response = "0x9000"; }; //@adam succesful execution
        }

        //return this.response;
    },
    process: function(smartcard, buffer){
        smartcard.processor.apdu = new apduJS.APDU();
        smartcard.processor.apdu.constr(buffer);
        smartcard.EEPROM.objectheap[0] = smartcard.processor.apdu;
        smartcard.processor.response = ""; //gSW
        smartcard.RAM.asyncState = false;
        smartcard.RAM.transaction_flag = false;
        smartcard.RAM.transaction_buffer = [];
        smartcard.processor.buffer = buffer; //store buffer for installer

        smartcard.processor.CLA = buffer[0];    //@adam class of instruction, category
        smartcard.processor.INS = buffer[1];    //@adam instruction
        smartcard.processor.P1 = buffer[2];     //@adam parameter 1
        smartcard.processor.P2 = buffer[3];     //@adam parameter 2
        smartcard.processor.LC = buffer[4];     //@adam length of command data

        var found = false;



        //@adam if select applet command
        if ((smartcard.processor.CLA == 0) && (smartcard.processor.INS == 0xA4) && (smartcard.processor.P1 == 0x04) && (smartcard.processor.P2 == 0x00)) {
            return selectApplet(buffer.slice(5,5+smartcard.processor.LC)); //TODO --> should probably return here
        } else {
            smartcard.RAM.select_statement_flag = 0;
        }

        if((smartcard.EEPROM.selectedApplet.AID.join() === smartcard.processor.installerAID.join()) && (smartcard.processor.CLA == 0x80)){
            return installer.process(smartcard);//check this -> TODAY
        } 
        var startcode = CAPFunctions.getStartCode(smartcard.EEPROM.selectedApplet.CAP, smartcard.EEPROM.selectedApplet.AID, 7);
        var params = [];
        params[0] = 0;
        jcvm.executeBytecode(smartcard.EEPROM.selectedApplet.CAP, startcode, params, 0,
            smartcard.EEPROM.selectedApplet.appletRef, smartcard);

        var output = "";
            if (smartcard.apdu.getCurrentState() >= 3) {
                for (var k = 0; k < smartcard.apdu.getBuffer().length; k++) {
                    output += addX(addpad(smartcard.apdu.getBuffer()[k])) + " ";
                    //output += this.apdu.getBuffer()[k] + "";
                }
            }
        //return strout + " " + response; << haven't implemented code that uses strout yet
        return output + this.response;
    },

    /* 
     *  JCVM Functions  
     */
    storeArray: function(smartcard, arref, index, value) {
        if (arref == null) { jcvm.executeBytecode.exception_handler(jlang, 7, ""); }
        if (arref.toString().slice(0, 1) == "H") {
            var ref = arref.slice(1).split("#");
            var obj = smartcard.EEPROM.objectheap[Number(ref[0])];
            if ((index >= Number(ref[2])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                APDUFunctions.setArray(obj, Number(ref[1]), index, value);
                //APISave(ref[0], obj.save());
            }
        } else if (arref.toString().slice(0, 1) == "T") {
            var ref = arref.slice(1).split("#");
            var tpsn = Number(ref[0])
            if ((index >= Number(ref[1]))|| (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                smartcard.RAM.transient_data[tpsn + index] = value;
            }
          } else {
            arref = Number(arref);
            index = Number(index);
            if ((index >= EEPROMFunctions.getHeapValue(smartcard.EEPROM, arref)) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                EEPROMFunctions.setHeapValue(smartcard.EEPROM, arref + index + 1, value);
            };
        }
     },
     loadArray: function(smartcard, arref, index) {
        var out;
        if (arref == null) { jcvm.executeBytecode.exception_handler(jlang, 7, ""); }
        if (arref.toString().slice(0, 1) == "H") {
            var ref = arref.slice(1).split("#");
            if ((index >= Number(ref[2])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {

                var obj = EEPROMFunctions.getObjectHeap(smartcard.EEPROM)[Number(ref[0])];
                out = APDUFunctions.getArray(obj, Number(ref[1]), index);
     
            }
        } else if (arref.toString().slice(0, 1) == "T") {
            var ref = arref.slice(1).split("#");
            var tpsn = Number(ref[0]);
            if ((index >= Number(ref[1])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                out = smartcard.RAM.transient_data[tpsn + index];
            } 
        } else {
            arref = Number(arref);
            index = Number(index);
            if ((index >= EEPROMFunctions.getHeapValue(smartcard.EEPROM, arref)) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else { out = EEPROMFunctions.getHeapValue(smartcard.EEPROM, arref + index + 1); }
        }
        return out;
    },

    /* 
     *  JCSystem Functions  
     */
    abortTransaction: function (smartcard) {

        if (!smartcard.RAM.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 2); }
        else {
            smartcard.RAM.transaction_flag = false;
            smartcard.RAM.transaction_buffer = [];
        }
        
        return;
    },//00

    beginTransaction: function (smartcard) {
        if (smartcard.RAM.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 1); }
        else { smartcard.RAM.transaction_flag = true; }

        return;
    },//01
    commitTransaction: function (smartcard) {//TODO --> Execution handler convert to hex array for jframework
        if (!smartcard.RAM.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 2); }
        else {
            smartcard.RAM.transaction_flag = false;
            var len = smartcard.RAM.transaction_buffer.length;
            for (var j = 0; j < len; j++) {
                var spl = smartcard.RAM.transaction_buffer[j].split(";");//why split on ;
                if (spl.length == 1) {
                    EEPROMFunctions.newHeap(smartcard.EEPROM, spl[0]);
                } else {
                    EEPROMFunctions.setHeap(smartcard.EEPROM, Number(spl[0]), Number(spl[1]));
                }
                
            }
            smartcard.RAM.transaction_buffer = [];
        }
        return;
    }
    //02
}