function EEPROM() {
    this.cardName;
	this.heap = [0xA0,0x00];
	this.packages = [];
    this.installedApplets = [{'AID': [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01], 'appletRef': -1}];
    this.selectedApplet = {'AID': undefined, 'appletRef': undefined, 'CAP': undefined};
    this.objectheap = [];
}

exports.EEPROM = EEPROM;