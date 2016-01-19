var eepromJS = require('./eeprom2.js');
var ramJS = require('./ram.js');
var apduprocessorJS = require('./processor.js');
var jcsystemJS = require('./java.framework/JCSystem.js')

function JavaCard(cardName){
    this.cardName = cardName;
    this.RAM = new ramJS.RAM();
    this.EEPROM = new eepromJS.EEPROM(this.RAM);//TODO --> should not have access to RAM, functions should be called through javacard/ processor
    this.APDUProcessor = new apduprocessorJS.APDUProcessor(this);
    this.JCSystem = new jcsystemJS.JCSystem(this.EEPROM, this.RAM);
    //this.JCVM = new jcvmJS.JCVM();
    //this.EEPROM.heap = "A10,0,128,128,184,0,0,8,6,221,2,3,4,5,0,0,127,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,0,T0#2#1,T2#1#1,T3#1#1,0,A3,1".split(",");
    //.packages = [];
    //this.packages[1] = "DD 02 03 04 05";
    //this.appletInstances = []; this.appletInstances[0] = new eepromJS.appletInstance(1,"DD 02 03 04 05 00 ",131);
    //this.packageApplets = []; this.packageApplets[1] = new eepromJS.appletInstance(1, "DD 02 03 04 05 00 ", 40);
    
    

}

function setupStaticFields(CAPfile,pk) {

    //setup static fields
    var s = "";
    //segment 1

    var sri = CAPfile.COMPONENT_StaticField.array_init_count; 

    for (var j = 0; j < sri; j++) {
        var t = CAPfile.COMPONENT_StaticField.array_init[j].type;
        var ct = CAPfile.COMPONENT_StaticField.array_init[j].count;
        var vals = CAPfile.COMPONENT_StaticField.array_init[j].values;
        var size = 0;
        switch (t) {
            case 2:
            case 3:
                size = 1; break;
            case 4:
                size = 2; break;
            case 5:
                size = 4; break;
        }

        var ratio = (ct / size);
        ghs = EEPROM.getHeapSize(); //2 (A10,0)
        s += (ghs >> 8) & 0xFF + "," + ghs & 0xFF + ",";

        setHeap(-1, ratio);
        var k = 0;
        var tempval;
        for (var k = 0; k < ratio;) {

            switch (size) {
                case 1:
                    tempval = vals[k];
                    break;
                case 2:
                    tempval = (vals[k] << 8) + vals[k + 1];
                    break;
                case 4:
                    tempval = (vals[k] << 24) + (vals[k + 1] << 16) + (vals[k + 2] << 8) + vals[k + 3];
                    break;
            }
            setHeap(-1, tempval);
            k += size;
        }

    }

    //segment 2

    sri = CAPfile.COMPONENT_StaticField.reference_count - sri; 
    for (var j = 0; j < sri; j++) {
        s += "0,0,";
    }

    //segment 3
    sri = CAPfile.COMPONENT_StaticField.default_value_count; 
    for (var j = 0; j < sri; j++) {
        s += "0,"; 
    }

    //segment 4
    sri = CAPfile.COMPONENT_StaticField.non_default_value_count; 
    for (var j = 0; j < sri; j++) {
        s += CAPfile.COMPONENT_StaticField.non_default_values[j] + ",";
    }

    newStaticField(pk, s);


}

//padding should be moved somewhere else used by applet.js
function addpad(d) {
    var hex = Number(d).toString(16).toUpperCase();

    while (hex.length < 2) {
        hex = "0" + hex;
    }

    return hex; //"0x" +
}

exports.JavaCard = JavaCard;


