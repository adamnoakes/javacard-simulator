var installer = require('./installer.js');
var apduJS = require('./java.framework/APDU.js');
var jcvm = require('./jcvm.js');
var opcodes = require('./opcodes.js');
var eepromJS = require('./eeprom.js');
var ramJS = require('./ram.js');

function Processor(RAM, EEPROM){
    this.RAM = new ramJS.RAM();
    this.EEPROM = new eepromJS.EEPROM();
	this.response = undefined;
    this.buffer = [];
	this.CLA = undefined;
	this.INS = undefined;
	this.P1 = undefined;
	this.P2 = undefined;
	this.LC = undefined;
	this.apdu = undefined;
	this.selectedAID = undefined;
	this.appletInstance = undefined;
	this.installerAID = [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01];//merge into installer
	//this.installer = new installJS.Installer(this);//Should this be moved down? --> YES when select install applet, just realised it messed up probably due to installer boolean down there \/
}


    

function addpad(d) {
    var hex = Number(d).toString(16);

    while (hex.length < 2) {
        hex = "0" + hex;
    }

    return hex; //"0x" +
}

function addX(d) { return "0x" + d;}

exports.Processor = Processor;