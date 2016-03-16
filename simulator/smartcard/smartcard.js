var eeprom = require('./eeprom.js');
var ram = require('./ram.js');
var processor = require('./processor.js');

module.exports = {
	/* The virtual smart card object */
    Smartcard: function(cardName, cb){
        this.EEPROM = new eeprom.EEPROM();
        this.RAM = new ram.RAM();
        this.processor = new processor.Processor();
        //set the card name
        this.EEPROM.cardName = cardName;
    },

    /**
	 * Wrapper function for processScript.
	 *
	 * @param  {Smartcard} smartcard  The Smartcard object.
	 * @param  {Array}     apduScript An array of apdu commands.
	 * @param  {Function}  cb         The callback function
	 */
    process: function(smartcard, apduScript, cb){
		processScript(smartcard, apduScript, cb);
    }
};

/**
 * Takes an array of APDU commands and sends them to the processor
 * one by one to be processed.
 *
 * @param  {Smartcard} smartcard  The Smartcard object.
 * @param  {Array}     apduScript An array of apdu commands.
 * @param  {Function}  cb         The callback function
 */
function processScript(smartcard, apduScript, cb){
	if(!(apduScript instanceof Array)){
		return cb(new Error('Unrecognised APDU format'), '0x6FFF');
	}
	processor.process(smartcard, apduScript.shift(), function(err, res){
		if(err){
			setImmediate(function() {
				cb(err, res);
			});
		} else if(apduScript.length > 0 && apduScript[0].constructor === Array &&
			apduScript[0][0] !== null && apduScript[0][0] !== undefined){
			processScript(smartcard, apduScript, cb);
		} else {
			setImmediate(function() {
				cb(null, res);
			});
		}
	});
}
