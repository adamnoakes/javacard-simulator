var jcvm = require('../jcvm/jcvm.js');
//should be part of processor or ram, used for storing and loading from array
module.exports = {
    //Class Token - 10
    //Token = 0x10;

    arrayCompare: function(src, srcOff, dest, destOff, length, smartcard) {

        try {

            for (var j = 0; j < length; j++) {

                if (jcvm.loadArray(smartcard, src, srcOff + j) > jcvm.loadArray(smartcard, dest, destOff + j)) {
                    return 1;
                } else if (jcvm.loadArray(smartcard, src, srcOff + j) > jcvm.loadArray(smartcard, dest, destOff + j)) {
                    return -1;
                }
            }
        } catch (err) {

            return 2;
        }
        return 0;
    }, //00 byte

    arrayCopy: function(src, srcOff, dest, destOff, length, smartcard) {
        JCSystem.beginTransaction();
        try {
            for (var j = 0; j < length; j++) {
                jcvm.storeArray(smartcard, dest, destOff + j, jcvm.loadArray(smartcard, src, srcOff + j));
            }
        } catch (err) {
            JCSystem.abortTransaction();
            //throw "ArrayOutofBoundsException";
            return 0;
        }
        JCSystem.commitTransaction();
        return 1;
    }, //01 short

    arrayCopyNonAtomic: function(src, srcOff, dest, destOff, length, smartcard) {

        try {
            for (var j = 0; j < length; j++) {
                jcvm.storeArray(smartcard, dest, destOff + j, jcvm.loadArray(smartcard, src, srcOff + j));
                //alert(arrload(src, srcOff + j));
            }
        } catch (err) {
            //throw "ArrayOutofBoundsException";
            return 0;
        }
    }, //02 short

    arrayFillNonAtomic: function(bArray, bOff, bLen, bValue, smartcard) {
        try {
            for (var j = 0; j < length; j++) {
                jcvm.storeArray(smartcard, bArray, bOff + j, bValue);
            }
        } catch (err) {
            return 0;
            //throw "ArrayOutofBoundsException";
        }
        return 1;

    }, //03 short
    getShort: function(bArray, bOff, smartcard) {
        makeShort(jcvm.loadArray(smartcard, bArray, bOff), jcvm.loadArray(smartcard, bArray, bOff + 1));
        return 1;
    }, //04 short
    makeShort: function(b1, b2) {
        return (((b1 << 8) & 0xFF00) | (b2 & 0xFF))
    }, //05 short
    setShort: function(bArray, bOff, sValue, smartcard) {
        var b1 = ((sValue & 0xFF00) >> 8);
        var b2 = (sValue & 0xFF);
        try {
            //alert(bArray + " " + bOff + " " + sValue);
            jcvm.storeArray(smartcard, bArray, bOff, b1);
            jcvm.storeArray(smartcard, bArray, bOff + 1, b2)
        } catch (err) {
            return 0;
            //throw "ArrayOutofBoundsException";
        }
        return 1;
    }, //06 short
};