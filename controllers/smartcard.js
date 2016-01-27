var EEPROMFunctions = require('/eeprom.js');

modules.exports = {
    storeArray: function(smartcard, arref, index, value) {
        if (arref == null) { jcvm.executeBytecode.exception_handler(jlang, 7, ""); }
        if (arref.toString().slice(0, 1) == "H") {
            var ref = arref.slice(1).split("#");
            var obj = smartcard.EEPROM.objectheap[Number(ref[0])];
            if ((index >= Number(ref[2])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                obj.setArray(Number(ref[1]), index, value);
                //APISave(ref[0], obj.save());
            }
        } else if (arref.toString().slice(0, 1) == "T") {
            var ref = arref.slice(1).split("#");
            var tpsn = Number(ref[0])
            if ((index >= Number(ref[1]))|| (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                smartcard.RAM.transient_data[tpsn + index] = value;
            }
          } else {

            arref = Number(arref);
            index = Number(index);
            if ((index >= smartcard.EEPROM.heap[arref]) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                EEPROMFunctions.setHeapValue(smarcard.EEPROM, arref + index + 1, value);
            };
        }
    },
    loadArray = function(smartcard, arref, index) {
        var out;
        if (arref == null) { jcvm.executeBytecode.exception_handler(jlang, 7, ""); }
        if (arref.toString().slice(0, 1) == "H") {
            var ref = arref.slice(1).split("#");
            if ((index >= Number(ref[2])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {

                var obj = smartcard.EEPROM.objectheap[Number(ref[0])];
                out = obj.getArray(Number(ref[1]), index);
     
            }
        } else if (arref.toString().slice(0, 1) == "T") {
            var ref = arref.slice(1).split("#");
            var tpsn = Number(ref[0]);
            if ((index >= Number(ref[1])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                out = smartcard.RAM.transient_data[tpsn + index];
            }
        } else {
            arref = Number(arref);
            index = Number(index);
            if ((index >= smartcard.EEPROM.heap[arref]) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else { out = smartcard.EEPROM.heap[arref + index + 1]; }
        }
        return out;
    },
    loadArray: function(smartcard, arref, index) {
        var out;
        if (arref == null) { jcvm.executeBytecode.exception_handler(jlang, 7, ""); }
        if (arref.toString().slice(0, 1) == "H") {
            var ref = arref.slice(1).split("#");
            if ((index >= Number(ref[2])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                var obj = this.getObjectHeap()[Number(ref[0])];
                out = obj.getArray(Number(ref[1]), index);
     
            }
        } else if (arref.toString().slice(0, 1) == "T") {
            var ref = arref.slice(1).split("#");
            var tpsn = Number(ref[0]);
            if ((index >= Number(ref[1])) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else {
                out = this.RAM.transient_data[tpsn + index];
            } 
        } else {
            arref = Number(arref);
            index = Number(index);
            if ((index >= this.getHeapValue(arref)) || (index < 0)) { jcvm.executeBytecode.exception_handler(jlang, 5, ""); }
            else { out = this.getHeapValue(arref + index + 1); }
        }
        return out;
    };
}