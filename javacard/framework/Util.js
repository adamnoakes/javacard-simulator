/*!
 * AID (Class token: 6)
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var jcvm = require('../jcre/jcvm.js');
//-> No this should not have reference to jcvm, the arrays should be passed directly

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
    arrayCopyNew: function(src, srcOff, dest, destOff, length) {
        var args;
        //JCSystem.beginTransaction();
        //if dest.length <  destOff + length or src.length < srcOff + length then throw an exception
        //in reality, this solution will not result in an error, it will extend the array when needed
        //and stop copying from the src array when the end is reached.
        try {
            args = src.slice(srcOff, length+1);
            args.unshift(length);
            args.unshift(destOff);
            Array.prototype.splice.apply(dest,args);
        } catch (err) {
            //JCSystem.abortTransaction();
            //throw "ArrayOutofBoundsException";
            return 0;
        }
       // JCSystem.commitTransaction();
        return 1;
    }
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
    JCSystem.beginTransaction();
    try {
        for (var j = 0; j < length; j++) {
            dest[destOff + j] = src[srcOff + j];
        }
    } catch (err) {
        JCSystem.abortTransaction();
        //throw "ArrayOutofBoundsException";
    }
    JCSystem.commitTransaction();
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
    return (((b1 << 8) & 0xFF00) | (b2 & 0xFF))
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