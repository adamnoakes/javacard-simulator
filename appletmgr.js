var eepromJS = require('./eeprom2.js');
var apduJS = require('./java.framework/APDU.js');
var jcvmJS = require('./jcvm.js');
var capJS = require('./cap.js');
var installJS = require('./installer.js');

function JavaCard(){
    this.cardName = "Calculator";
    this.EEPROM = new eepromJS.EEPROM();
    //this.JCVM = new jcvmJS.JCVM();
    this.EEPROM.heap = "A10,0,128,128,184,0,0,8,6,221,2,3,4,5,0,0,127,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,0,T0#2#1,T2#1#1,T3#1#1,0,A3,1".split(",");
    this.packages = [];
    this.packages[1] = "DD 02 03 04 05";
    this.appletInstances = []; this.appletInstances[0] = new eepromJS.appletInstance(1,"DD 02 03 04 05 00 ",131);
    this.packageApplets = []; this.packageApplets[1] = new eepromJS.appletInstance(1, "DD 02 03 04 05 00 ", 40);

    this.asyncState = false;
    this.transaction_flag = false;
    this.transaction_buffer = [];
    this.transient_data = [];
    this.select_statement_flag = 0;
    this.appletInstance = null;
    this.selectedAID = [];  //selected applet id
    this.installation_failed = false;
    this.installer = new installJS.Installer(this.EEPROM);;//new installJS.Installer();;


    this.processAPDU = function(buffer){
        var apdu = new apduJS.APDU();
        apdu.constr(buffer);
        //JCVM.objectheap[0] = apdu;
        var response = ""; //gSW
        this.asyncState = false;
        this.transaction_flag = false;
        this.transaction_buffer = [];

        var CLA = buffer[0];    //@adam class of instruction, category
        var INS = buffer[1];    //@adam instruction
        var P1 = buffer[2];     //@adam parameter 1
        var P2 = buffer[3];     //@adam parameter 2
        var LC = buffer[4];     //@adam length of command data
        var CAP;

        var found = false;
        var installerAID = [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01];

        //@adam if select applet command
        if ((CLA == 0) && (INS == 0xA4) && (P1 == 0x04) && (P2 == 0x00)) {
            selectApplet();
        }
        console.log("selectedAID: " + selectedAID + " CLA: " + CLA + " INS: " + INS);
        if((selectedAID.join() === installerAID.join()) && (CLA == 0x80)){
            response = this.installer.execute(buffer);
        } 
        //console.log("tempComponents");
        //console.log(this.tempComponents);
        //console.log("Current component: " + this.currentComponent);

        /*
         *Functions
         */
        function selectApplet(){
            this.transient_data = []; //reset transient data
            this.select_statement_flag = 1;

            //delect curent applet
            this.selectedAID = []; //not the way to deselect, see code below
            this.appletInstance = null;// not the way to delect see code below
            /*if (AppletManager.SelectedAppletIndex >= 0) {
                
                var CAP = getCAP(cardname, gpID);
                
                var startcode = getStartCode(CAP, AppletManager.installbc, 4);
                var params = [];
               
                if (startcode > 0) {
                    Recover.BackupAll();
                    executeBytecode(CAP, startcode, params, 3, gRef);
                }
            }*/
            var installer = true;//@adam checks if command data is installer appler //TODO can probably replace with SLICE to get AID
            for (var j = 0; j < LC; j++) {if (buffer[5 + j] != installerAID[j]) { installer = false;} }
                console.log(installer);
            //@if above is true then select the installer applet
            if (installer) {
                this.selectedAID = installerAID;
                console.log("installerAID " + installerAID + "selectedAID: " + selectedAID + ".");
                //create installer applet and send it reference to the EEPROM so that it can program the card :-) <-- didn't work moving that code up to the top
                console.log("E@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                console.log(this.EEPROM);
                
                
                //could add help message to return (e.g. selected AID is ...)

                found = true;
            } else {
                //TODO convert to integer storage
                /*
                for (var j = 0; j < LC; j++) {
                    this.selectedAID = this.selectedAID + addpad(buffer[5+j]) + " ";
                }
                
                for (a of this.appletInstances) {
                    console.log(a.AID + " " + this.selectedAID.toUpperCase());
                    if(a.AID == this.selectedAID.toUpperCase()){
                        this.appletInstance = a;
                    }
                }
                if(this.appletInstance != null){
                    console.log("heap loc: " + this.appletInstance.addressPointer);
                    found = true;
                }*/

            }

            if (!found) {
                response = "0x6A82"; //@adam no applet found code
            } else {
                if (response == "") { response = "0x9000"; }; //@adam succesful execution
            }

            return response;
        }
        //return strout + " " + response; << haven't implemented code that uses strout yet
        return response;
    }
}

function setupStaticFields(CAPfile,pk) {

    //setup static fields
    var s = "";
    //segment 1

    var sri = CAPfile.COMPONENT_StaticField.array_init_count; 

    for (var j = 0; j < sri; j++) {
        var t = CAPfile.COMPONENT_StaticField.array_init[j].type;
        var ct = CAPfile.COMPONENT_StaticField.array_init[j].count;
        var vals = CAPfile.COMPONENT_StaticField.array_init[j].values;
        var size = 0;
        switch (t) {
            case 2:
            case 3:
                size = 1; break;
            case 4:
                size = 2; break;
            case 5:
                size = 4; break;
        }

        var ratio = (ct / size);
        ghs = EEPROM.getHeapSize(); //2 (A10,0)
        s += (ghs >> 8) & 0xFF + "," + ghs & 0xFF + ",";

        setHeap(-1, ratio);
        var k = 0;
        var tempval;
        for (var k = 0; k < ratio;) {

            switch (size) {
                case 1:
                    tempval = vals[k];
                    break;
                case 2:
                    tempval = (vals[k] << 8) + vals[k + 1];
                    break;
                case 4:
                    tempval = (vals[k] << 24) + (vals[k + 1] << 16) + (vals[k + 2] << 8) + vals[k + 3];
                    break;
            }
            setHeap(-1, tempval);
            k += size;
        }

    }

    //segment 2

    sri = CAPfile.COMPONENT_StaticField.reference_count - sri; 
    for (var j = 0; j < sri; j++) {
        s += "0,0,";
    }

    //segment 3
    sri = CAPfile.COMPONENT_StaticField.default_value_count; 
    for (var j = 0; j < sri; j++) {
        s += "0,"; 
    }

    //segment 4
    sri = CAPfile.COMPONENT_StaticField.non_default_value_count; 
    for (var j = 0; j < sri; j++) {
        s += CAPfile.COMPONENT_StaticField.non_default_values[j] + ",";
    }

    newStaticField(pk, s);


}

//padding should be moved somewhere else used by applet.js
function addpad(d) {
    var hex = Number(d).toString(16).toUpperCase();

    while (hex.length < 2) {
        hex = "0" + hex;
    }

    return hex; //"0x" +
}

exports.JavaCard = JavaCard;


