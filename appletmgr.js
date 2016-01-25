var eepromJS = require('./eeprom2.js');
var ramJS = require('./ram.js');
var apduprocessorJS = require('./processor.js');
var jcsystemJS = require('./java.framework/JCSystem.js')

function JavaCard(cardName){
    this.cardName = cardName;
    this.RAM = new ramJS.RAM();
    this.EEPROM = new eepromJS.EEPROM();
    this.APDUProcessor = new apduprocessorJS.APDUProcessor(this);
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
exports.JavaCard = JavaCard;


