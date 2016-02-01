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
    }
}