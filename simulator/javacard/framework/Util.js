/*!
 * Util
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module exports.
 * @public
 */

module.exports = {
    /**
     * Handles javacard.framework.Util api calls.
     */
    run: function(method, type, param, obj, smartcard){
        switch (method) {
            case 0:
                return arrayCompare(param[0], param[1], param[2], param[3], param[4]);
            case 1:
                return arrayCopy(param[0], param[1], param[2], param[3], param[4], smartcard);
            case 2:
                return arrayCopyNonAtomic(param[0], param[1], param[2], param[3], param[4]);
            case 3:
                return arrayFillNonAtomic(param[0], param[1], param[2], param[3]);
            case 4:
                return getShort(param[0], param[1]);
            case 5:
                return makeShort(param[0], param[1]);
            case 6:
                return setShort(param[0], param[1], param[2]);
            default:
                return new Error('Method ' + method + ' not defined for AID');
        }
    },
    arrayCopyNonAtomic: arrayCopyNonAtomic,
};

/**
 * Private functions
 * @private
 */

function arrayCompare(src, srcOff, dest, destOff, length) {
    try {
        for (var j = 0; j < length; j++) {
            if (src[srcOff + j] > dest[destOff + j]) {
                return 1;
            } else if (src[srcOff + j] > dest[destOff + j]) {
                return -1;
            }
        }
    } catch (err) {
        return new Error('ArrayIndexOutOfBoundsException');
    }
    return 0;
}


function arrayCopy(src, srcOff, dest, destOff, length, smartcard) {
    JCSystem.beginTransaction(smartcard);
    try {
        for (var j = 0; j < length; j++) {
            dest[destOff + j] = src[srcOff + j];
        }
    } catch (err) {
        JCSystem.abortTransaction(smartcard);
        //throw "ArrayOutofBoundsException";
    }
    JCSystem.commitTransaction(smartcard);
}

function arrayCopyNonAtomic(src, srcOff, dest, destOff, length) {
    try {
        for (var j = 0; j < length; j++) {
            dest[destOff + j] = src[srcOff + j];
        }
    } catch (err) {
        //throw "ArrayOutofBoundsException";
    }
}

function arrayFillNonAtomic(bArray, bOff, bLen, bValue) {
    try {
        for (var j = 0; j < length; j++) {
            bArray[bOff + j] = bValue;
        }
    } catch (err) {
        return 0;
        //throw "ArrayOutofBoundsException";
    }
    return 1;

}

function getShort(bArray, bOff) {
    makeShort(bArray[bOff], bArray[bOff + 1]);
    return 1;
}

function makeShort(b1, b2) {
    return (((b1 << 8) & 0xFF00) | (b2 & 0xFF));
}

function setShort(bArray, bOff, sValue) {
    var b1 = ((sValue & 0xFF00) >> 8);
    var b2 = (sValue & 0xFF);
    try {
        //alert(bArray + " " + bOff + " " + sValue);
        bArray[bOff] = b1;
        bArray[bOff + 1] = b2;
    } catch (err) {
        return 0;
        //throw "ArrayOutofBoundsException";
    }
    return 1;
}
