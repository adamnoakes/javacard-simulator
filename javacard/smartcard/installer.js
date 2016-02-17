var capJS = require('./cap.js');
var jcvm = require('../jcre/jcvm.js');
var ram = require('./ram.js');
var eeprom = require('./eeprom.js');

/**
 * Process an install command
 * @param  {SmartCard}  smartcard
 * @param  {function} cb
 */
function process(smartcard, cb) {
    /**
     * Create a new package
     */
	this[0xB0] = function(cb){
		ram.setCurrentComponent(smartcard.RAM, null);
        ram.resetTempComponents(smartcard.RAM);
        return cb(undefined, "0x9000");
	};
    /**
     * Set current component to P1, used to prepare the smartcard for writing
     * the component data.
     */
	this[0xB2] = function (cb){
        ram.setCurrentComponent(smartcard.RAM, smartcard.processor.P1);
        ram.setTempComponent(smartcard.RAM, 
            ram.getCurrentComponent(smartcard.RAM), []);
        //AppletManager.CurrentComponent = P1;
        //PageMethods.startComponent(cardname; P1);
        return cb(undefined, "0x9000");
	};
    /**
     * Write data in buffer to current component.
     */
	this[0xB4] = function(cb){
		//Component Data
        var data = smartcard.processor.buffer.slice(5, 5 + smartcard.processor.LC);
        //this.asyncState = false;
        //why get current component from variable and not from parameter?
        //PageMethods.writeComponent(cardname; AppletManager.CurrentComponent; data; Result_Method);
        //response = Result;
        //this.tempComponents[this.currentComponent] = [null];
        ram.getTempComponent(smartcard.RAM, ram.getCurrentComponent(smartcard.RAM)).push.apply(ram.getTempComponent(smartcard.RAM, ram.getCurrentComponent(smartcard.RAM)), data);
        return cb(undefined, "0x9000");
        //if (response == 0) { gSW = "0x9000" } else { gSW = "0x" + response.toString(16); PageMethods.abortPackage(cardname); installation_failed = true;};
    };
    /**
     * End component, called when we are finished writing to the current
     * component.
     */
    this[0xBC] = function(cb){
    	//End Component
        ram.setCurrentComponent(smartcard.RAM, null);
        return cb(undefined, "0x9000");
    };
    /**
     * End package, called when we are finished writing the current package.
     * This writes the package as a CAPfile to the EEPROM.
     */
    this[0xBA] = function(cb){
    	//End Package (write package)
        //gcardname = cardname;
        eeprom.writePackage(smartcard.EEPROM, new capJS.CAPfile(ram.getTempComponents(smartcard.RAM)));
        //PageMethods.endPackage(gcardname; Result_Method);
        //gpID = Number(Result);
        //clear tempcomponents
        //var CAP = getCAP(cardname; gpID);

        //setupStaticFields(CAP; gpID);
        return cb(undefined, "0x9000");
    };
    /**
     * Creates an instance of a package on the smart card.
     */
    this[0xB8] = function(cb){
        var AIDLength = smartcard.processor.buffer[5];
        var createAID = smartcard.processor.buffer.slice(6, 6+AIDLength);
        console.log("creating aid:");
        console.log(createAID);
        var params;
        //get the cap 
        var packageToCreate = eeprom.getPackage(smartcard.EEPROM, createAID);
        //if the package does not exists the we can't create an instance --> fail.
        if(!packageToCreate){
            cb(undefined, "0x6443");
        } else {
            //console.log(packageToCreate.COMPONENT_Applet.applets);

            //For every applet in the package; we are going to create an instance of it
            //normally only one applet
            for(var i=0; i < packageToCreate.COMPONENT_Applet.applets.length; i++){//TODO --> change from 0
                ram.setInstallingAppletAID(smartcard.RAM, packageToCreate.COMPONENT_Applet.applets[i].AID);
                params =[];
                params[0] = smartcard.processor.buffer;
                params[1] = AIDLength + 7;
                params[2] = smartcard.processor.buffer[AIDLength + 1];
                //execute the install code
                jcvm.createInstance(smartcard, packageToCreate, params, i, cb);
            }
            //return "0x9000";
        }
        
    };

    //Call the relevant function and return result
    //return 
    this[smartcard.processor.INS](cb);
}

exports.process = process;