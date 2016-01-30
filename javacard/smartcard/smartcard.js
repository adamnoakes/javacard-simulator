var eeprom = require('./eeprom.js');
var ram = require('./ram.js');
var processor = require('./processor.js');

module.exports = {
    SmartCard: function(cardName, cb){
        this.EEPROM = new eeprom.EEPROM();
        this.RAM = new ram.RAM();
        this.processor = new processor.Processor();
        this.EEPROM.cardName = cardName;
    },
    /* 
     *  JCVM Functions  
     */


}