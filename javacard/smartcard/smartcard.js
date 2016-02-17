var eeprom = require('./eeprom.js');
var ram = require('./ram.js');
var processor = require('./processor.js');

module.exports = {
	/* The virtual smart card object */
    SmartCard: function(cardName, cb){
        this.EEPROM = new eeprom.EEPROM();
        this.RAM = new ram.RAM();
        this.processor = new processor.Processor();
        //set the card name
        this.EEPROM.cardName = cardName;
    },

    /**
     * Takes an array of APDU commands and sends them to the processor
     * one by one to be processed.
     * @param  {SmartCard}   smartcard  [description]
     * @param  {Array}   apduScript [description]
     * @param  {Function} cb         [description]
     */
    process: function(smartcard, apduScript, cb){
		processScript(smartcard, apduScript, cb);
  		/*for(i=0; i<req.body.APDU.length; i++){
            if(req.body.APDU[i][0] != null){
            	//This is when simulation starts
                response = processor.process(smartcard, req.body.APDU[i], function(err, res){
                	if(err){

                	}

                });
                if(response == ""){
                	//TODO -> send error
                    break;
                }
            }
        }*/
    }
}

function processScript(smartcard, apduScript, cb){
	processor.process(smartcard, apduScript.shift(), function(err, res){
		if(err){
			setImmediate(function() {
				cb(err, res);
			});
		} else if(apduScript.length > 0 && apduScript[0].constructor === Array
			&& apduScript[0][0] != null && apduScript[0][0] !== undefined){
			processScript(smartcard, apduScript, cb);
		} else {
			setImmediate(function() {
				cb(null, res);
			});
		}
	});
}