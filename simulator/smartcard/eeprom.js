/*!
 * eeprom
 *
 * Contains the EEPROM structure and methods used to modify
 * values in the EEPROM.
 *
 * @author Adam Noakes
 * University of Southampton
 */


module.exports = {
	/**
	 * Represents a smart cards EEPROM memory.
	 * 
	 * @param {String} cardName The name of the card, used in the card Manager
	 */
	EEPROM: function(cardName) {
		this.cardName = cardName;
		this.packages = {};
		this.heap = [0xA0,0x00];//@private
		this.installedApplets = {};
		this.installedApplets[[0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01]] = -1;
		this.objectheap = [];
	},

	/**
	 * Pushes an object, or array of objects onto the object heap.
	 * 
	 * @param  {EEPROM} EEPROM The EEPROM object.
	 * @param  {Object} obj    Object or Array of Objects to be pushed.
	 */
	appendObjectHeap: function(EEPROM, obj) {
		if(obj.constructor === Array){//aprox 3 times quicker than instance of array
			EEPROM.objectheap.push.apply(EEPROM.heap, obj);
		} else {
			EEPROM.objectheap.push(obj);
		}
	},

	/**
	 * Writes a package's CAPfile to EEPROM.
	 * 
	 * @param  {EEPROM} EEPROM    The EEPROM object.
	 * @param  {CAPfile} capfile
	 */
	writePackage: function(EEPROM, capfile){
		EEPROM.packages[capfile.COMPONENT_Header.AID] = capfile;
	},

	/**
	 * Finds package with given AID in the EEPROM.
	 * 
	 * @param  {EEPROM} EEPROM The smartcards EEPROM
	 * @param  {AID} 	AID    The package's AID
	 * @return {CAPfile}       The package's CAPfile
	 */
	getPackage: function(EEPROM, AID){
		//find the package with given AID and return it.
		return EEPROM.packages[AID];
	},

	/**
	 * Sets a value on the heap. If transaction is in progress,
	 * the change will be applied when the transaction is finished.
	 * 
	 * @param {Smartcard} smartcard The Smartcard object.
	 * @param {Number} pos       	The position in the heap.
	 * @param {Number} val       	The value to set to.
	 */
	setHeap: function(smartcard, pos, val){
		if(!smartcard.RAM.transactionFlag){
			smartcard.EEPROM.heap[pos] = val;
		} else {
			smartcard.RAM.transaction_buffer.push([pos, val]);
		}
	},

	/**
	 * Pushes a value onto the heap. If transaction is in progress,
	 * the change will be applied when the transaction is finished.
	 * 
	 * @param {Smartcard} smartcard The Smartcard object.
	 * @param {Number} val       	The value to set to.
	 */
	pushToHeap: function(smartcard, val){
		if(!smartcard.RAM.transactionFlag){
			smartcard.EEPROM.heap.push(val);
		} else {
			smartcard.RAM.transaction_buffer.push(val);
		}
	}
};
