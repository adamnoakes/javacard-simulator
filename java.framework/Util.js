var jcvm = require('../jcvm.js');
//should be part of processor or ram, used for storing and loading from array
module.exports = {
    //Class Token - 10
    //Token = 0x10;

    arrayCompare: function(src, srcOff, dest, destOff, length, javacard) {

        try {

            for (var j = 0; j < length; j++) {

                if (jcvm.arrload(src, srcOff + j, javacard) > jcvm.arrload(dest, destOff + j, javacard)) {
                    return 1;
                } else if (jcvm.arrload(src, srcOff + j, javacard) > jcvm.arrload(dest, destOff + j, javacard)) {
                    return -1;
                }
            }
        } catch (err) {

            return 2;
        }
        return 0;
    }, //00 byte

    arrayCopy: function(src, srcOff, dest, destOff, length, javacard) {
        JCSystem.beginTransaction();
        try {
            for (var j = 0; j < length; j++) {
                jcvm.arrstore(dest, destOff + j, jcvm.arrload(src, srcOff + j), javacard);
            }
        } catch (err) {
            JCSystem.abortTransaction();
            //throw "ArrayOutofBoundsException";
            return 0;
        }
        JCSystem.commitTransaction();
        return 1;
    }, //01 short

    arrayCopyNonAtomic: function(src, srcOff, dest, destOff, length, javacard) {

        try {
            for (var j = 0; j < length; j++) {
                jcvm.arrstore(dest, destOff + j, jcvm.arrload(src, srcOff + j), javacard);
                //alert(arrload(src, srcOff + j));
            }
        } catch (err) {
            //throw "ArrayOutofBoundsException";
            return 0;
        }
    }, //02 short

    arrayFillNonAtomic: function(bArray, bOff, bLen, bValue, javacard) {
        try {
            for (var j = 0; j < length; j++) {
                jcvm.arrstore(bArray, bOff + j, bValue, javacard);
            }
        } catch (err) {
            return 0;
            //throw "ArrayOutofBoundsException";
        }
        return 1;

    }, //03 short
    getShort: function(bArray, bOff, javacard) {
        makeShort(jcvm.arrload(bArray, bOff), jcvm.arrload(bArray, bOff + 1), javacard);
        return 1;
    }, //04 short
    makeShort: function(b1, b2) {
        return (((b1 << 8) & 0xFF00) | (b2 & 0xFF))
    }, //05 short
    setShort: function(bArray, bOff, sValue, javacard) {
        var b1 = ((sValue & 0xFF00) >> 8);
        var b2 = (sValue & 0xFF);
        try {
            //alert(bArray + " " + bOff + " " + sValue);
            jcvm.arrstore(bArray, bOff, b1, javacard);
            jcvm.arrstore(bArray, bOff + 1, b2, javacard)
        } catch (err) {
            return 0;
            //throw "ArrayOutofBoundsException";
        }
        return 1;
    }, //06 short
};