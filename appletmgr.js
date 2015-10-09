var eepromJS = require('./eeprom2.js');
var apduJS = require('./java.framework/APDU.js');
var jcvmJS = require('./jcvm.js');

function JavaCard(){
    this.cardName = "Calculator"
    this.EEPROM = new eepromJS.EEPROM();
    //this.JCVM = new jcvmJS.JCVM();
    this.EEPROM.heap = "A10,0,128,128,184,0,0,8,6,221,2,3,4,5,0,0,127,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,0,T0#2#1,T2#1#1,T3#1#1,0,A3,1".split(",");
    this.packages = [];
    this.packages[1] = "DD 02 03 04 05";
    this.appletInstances = []; this.appletInstances[0] = new eepromJS.appletInstance(1,"DD 02 03 04 05 00",131);
    this.packageApplets = []; this.packageApplets[1] = new eepromJS.appletInstance(1, "DD 02 03 04 05 00", 40);

    this.response = ""; //gSW
    this.asyncState = false;
    this.transaction_flag = false;
    this.transaction_buffer = [];
    this.transient_data = [];
    this.select_statement_flag = 0;
    this.sAID = "";  //selected applet id

    this.processAPDU = function(buffer){
        var apdu = new apduJS.APDU();
        apdu.constr(buffer);
        //JCVM.objectheap[0] = apdu;

        response = ""; //gSW
        asyncState = false;
        transaction_flag = false;
        transaction_buffer = [];

        var CLA = buffer[0];    //@adam class of instruction, category
        var INS = buffer[1];    //@adam instruction
        var P1 = buffer[2];     //@adam parameter 1
        var P2 = buffer[3];     //@adam parameter 2
        var LC = buffer[4];     //@adam length of command data
        
        var CAP;

        var found = false;
        var iapp = [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01];

        //@adam if select applet command
        if ((CLA == 0) && (INS == 0xA4) && (P1 == 0x04) && (P2 == 0x00)) {
            transient_data = []; //reset transient data
            select_statement_flag = 1;
                    


            //delect curent applet
            /*if (AppletManager.SelectedAppletIndex >= 0) {
                
                var CAP = getCAP(cardname, gpID);
                
                var startcode = getStartCode(CAP, AppletManager.installbc, 4);
                var params = [];
               
                if (startcode > 0) {
                    Recover.BackupAll();
                    executeBytecode(CAP, startcode, params, 3, gRef);
                }
            }*/
            var bf1 = true;//@adam checks if command data is installer appler
            for (var j = 0; j < LC; j++) {if (buffer[5 + j] != iapp[j]) { bf1 = false; console.log("false");} }
                console.log(bf1);
            //@if above is true then select the installer applet
            if (bf1) {
                for (var j = 0; j < iapp.length; j++) {
                    this.sAID = this.sAID + addpad(iapp[j]) + " ";//aAid = 
                }
                
                //could add help message to return (e.g. selected AID is ...)

                found = true;
            } else {

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
//padding should be moved somewhere else used by applet.js
function addpad(d) {
    var hex = Number(d).toString(16);

    while (hex.length < 2) {
        hex = "0" + hex;
    }

    return hex; //"0x" +
}

exports.JavaCard = JavaCard;


