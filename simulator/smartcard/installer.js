var capJS = require('./cap.js');
var jcvm = require('../jcre/jcvm.js');
var ram = require('./ram.js');
var eeprom = require('./eeprom.js');

/**
 * Process an install command
 * @param  {SmartCard}  smartcard
 * @param  {function} cb
 */
function process(smartcard, buffer, cb) {

    /**
     * Create a new package.
     * 
     * @param  {Function} cb Callback function
     */
	this[0xB0] = function(cb){
		ram.setCurrentComponent(smartcard.RAM, null);
        ram.resetTempComponents(smartcard.RAM);
        cb(undefined, "0x9000");
	};
    /**
     * Set current component to P1, used to prepare the smartcard for writing
     * the component data.
     *
     * @param  {Function} cb Callback function
     */
	this[0xB2] = function (cb){
        ram.setCurrentComponent(smartcard.RAM, buffer[2]);//p1
        ram.setTempComponent(smartcard.RAM,
            ram.getCurrentComponent(smartcard.RAM), []);
        cb(undefined, "0x9000");
	};
    /**
     * Write data in buffer to current component.
     *
     * @param  {Function} cb     Callback function
     * @param  {Array}    buffer The buffer array
     */
	this[0xB4] = function(cb, buffer){
		//Component Data
        var data = buffer.slice(5, 5 + buffer[4]);//LC
        ram.getTempComponent(smartcard.RAM, ram.getCurrentComponent(smartcard.RAM)).push.apply(ram.getTempComponent(smartcard.RAM, ram.getCurrentComponent(smartcard.RAM)), data);
        cb(undefined, "0x9000");
    };
    /**
     * End component, called when we are finished writing to the current
     * component.
     *
     * @param  {Function} cb Callback function
     */
    this[0xBC] = function(cb){
    	//End Component
        ram.setCurrentComponent(smartcard.RAM, null);
        cb(undefined, "0x9000");
    };
    /**
     * End package, called when we are finished writing the current package.
     * This writes the package as a CAPfile to the EEPROM.
     *
     * @param  {Function} cb Callback function
     */
    this[0xBA] = function(cb){
    	//End Package (write package)
        eeprom.writePackage(smartcard.EEPROM, new capJS.CAPfile(smartcard.RAM.tempComponents));
        ram.tempComponents = [];
        cb(undefined, "0x9000");
    };
    /**
     * Creates an instance of a package on the smart card.
     *
     * @param  {Function} cb Callback function
     */
    this[0xB8] = function(cb, buffer){
        var AIDLength = buffer[5];
        var createAID = buffer.slice(6, 6+AIDLength -1);
        var appletAID = buffer.slice(6, 6+AIDLength);

        var params;
        var applets;
        //get the cap
        var packageToCreate = eeprom.getPackage(smartcard.EEPROM, createAID);
        //if the package does not exists the we can't create an instance --> fail.
        if(!packageToCreate){
            cb(undefined, "0x6443");
        } else {
            applets = packageToCreate.COMPONENT_Applet.applets;
            for(var i=0; i < applets.length; i++){
                if(applets[i].AID.join() === appletAID.join()){
                    ram.setInstallingAppletAID(smartcard.RAM, applets[i].AID);
                    params =[];
                    params[0] = buffer;
                    params[1] = 5;//7 + AIDLength;
                    params[2] = buffer[4];//buffer[AIDLength + 6];
                    //execute the install code
                    return jcvm.createInstance(smartcard, packageToCreate, params, i, cb);
                }
            }
            cb(new Error('Could not find applet.'), '0x6A82');
        }

    };
    //Call the relevant function and return result
    try{
        this[buffer[1]](cb, buffer);
    } catch (err){
        cb(new Error('SW_INS_NOT_SUPPORTED'), '0x6D00');
    }

}

exports.process = process;
exports.AID = [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01];
