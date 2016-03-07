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
		this.packages = [];
		this.heap = [0xA0,0x00];//@private
		this.installedApplets = [{'AID': [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01], 'appletRef': -1}];
		this.selectedApplet = {'AID': undefined, 'appletRef': undefined, 'CAP': undefined};
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
	 * Returns the CAP file for an applet specified by it's AID.
	 * 
	 * @param  {EEPROM} EEPROM    The EEPROM object.
	 * @param  {Array}  appletAID The applet's AID.
	 * @return {CAPfile}          The CAPfile for the applet.
	 */
	getAppletCAP: function(EEPROM, appletAID){
		for(var i = 0; i<EEPROM.packages.length; i++){
			for(var j = 0; j<EEPROM.packages[i].COMPONENT_Applet.applets.length; j++){
				if(EEPROM.packages[i].COMPONENT_Applet.applets[j].AID.join() === appletAID.join()){
					return EEPROM.packages[i];
				}
			}
		}
		return undefined;
	},

	/**
	 * Sets references in EEPROM for the specified applet AID.
	 * 
	 * @param  {EEPROM} EEPROM    The EEPROM object.
	 * @param  {Array}  appletAID The applet's AID.
	 */
	setSelectedApplet: function(EEPROM, appletAID){
		for(var i = 0; i<EEPROM.installedApplets.length; i++){
			if(EEPROM.installedApplets[i].AID.join() === appletAID.join()) {
				EEPROM.selectedApplet.AID =  EEPROM.installedApplets[i].AID;
				EEPROM.selectedApplet.appletRef = EEPROM.installedApplets[i].appletRef;
				EEPROM.selectedApplet.CAP = this.getAppletCAP(EEPROM, appletAID);
				return true;
			}
		}
		return false;
	},

	/**
	 * Writes a package's CAPfile to EEPROM.
	 * 
	 * @param  {EEPROM} EEPROM    The EEPROM object.
	 * @param  {CAPfile} capfile
	 */
	writePackage: function(EEPROM, capfile){
		console.log('CAPfile:');
		console.log(capfile);
		EEPROM.packages[EEPROM.packages.length] = capfile;
	},

	getPackage: function(EEPROM, AID){
		//find the package with given AID and return it.
		for(var i = 0; i < EEPROM.packages.length; i++){
			if(EEPROM.packages[i].COMPONENT_Header.AID.join() === AID.join()){
				return EEPROM.packages[i];
			}
		}
	},

	setHeap: function(smartcard, pos, val){
		if(!smartcard.processor.transaction_flag){
			smartcard.EEPROM.heap[pos] = val;
		} else {
			smartcard.RAM.transaction_buffer.push([pos, val]);
		}
	},

	pushToHeap: function(smartcard, val){
		if(!smartcard.processor.transaction_flag){
			smartcard.EEPROM.heap.push(val);
		} else {
			smartcard.RAM.transaction_buffer.push(val);
		}
	}
};
