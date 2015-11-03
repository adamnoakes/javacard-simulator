var installJS = require('./installer.js');
var apduJS = require('./java.framework/APDU.js');

function APDUProcessor(EEPROM, RAM){
	this.EEPROM = EEPROM;
	this.RAM = RAM;
	this.response = undefined;
	this.CLA = undefined;
	this.INS = undefined;
	this.P1 = undefined;
	this.P2 = undefined;
	this.LC = undefined;
	this.apdu = undefined;
	this.selectedAID = undefined;
	this.appletInstance = undefined;
	this.installerAID = [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01];//merge into installer
	this.installer = new installJS.Installer(this.EEPROM, this.RAM);//Should this be moved down? --> YES when select install applet, just realised it messed up probably due to installer boolean down there \/

	this.process = function(buffer){
		this.apdu = new apduJS.APDU();
        this.apdu.constr(buffer);
        //JCVM.objectheap[0] = apdu;
        this.response = ""; //gSW
        this.RAM.asyncState = false;
        this.RAM.transaction_flag = false;
        this.RAM.transaction_buffer = [];

        this.CLA = buffer[0];    //@adam class of instruction, category
        this.INS = buffer[1];    //@adam instruction
        this.P1 = buffer[2];     //@adam parameter 1
        this.P2 = buffer[3];     //@adam parameter 2
        this.LC = buffer[4];     //@adam length of command data
        this.CAP;

        var found = false;
        

        //@adam if select applet command
        if ((this.CLA == 0) && (this.INS == 0xA4) && (this.P1 == 0x04) && (this.P2 == 0x00)) {
            this.response = this.selectApplet(buffer); //TODO --> should probably return here
        }
        console.log("selectedAID: " + this.selectedAID + " CLA: " + this.CLA + " INS: " + this.INS);
        if((this.selectedAID.join() === this.installerAID.join()) && (this.CLA == 0x80)){
            this.response = this.installer.execute(buffer);
        } 
        //console.log("tempComponents");
        //console.log(this.tempComponents);
        //console.log("Current component: " + this.currentComponent);

        /*
         *Functions
         */

        //return strout + " " + response; << haven't implemented code that uses strout yet
        return this.response;
	}

	this.selectApplet = function(buffer){//TODO ----> SHould just pass in the AID
        this.RAM.transient_data = []; //reset transient data
        this.RAM.select_statement_flag = 1;

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
        for (var j = 0; j < this.LC; j++) {if (buffer[5 + j] != this.installerAID[j]) { installer = false;} }
        console.log(installer);
        //@if above is true then select the installer applet
        if (installer) {
            this.selectedAID = this.installerAID;
            console.log("installerAID " + this.installerAID + "selectedAID: " + this.selectedAID + ".");
            //create installer applet and send it reference to the EEPROM so that it can program the card :-) <-- didn't work moving that code up to the top
            console.log("E@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            console.log(this.EEPROM);


            //could add help message to return (e.g. selected AID is ...)

            found = true;//TODO --> should probably return here too? instead of keep using response variable.
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
            this.response = "0x6A82"; //@adam no applet found code
        } else {
            if (this.response == "") { this.response = "0x9000"; }; //@adam succesful execution
        }

        return this.response;
    }
}

exports.APDUProcessor = APDUProcessor;