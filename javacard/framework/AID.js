/*!
 * AID (Class token: 6)
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var util = require('./Util.js');

/**
 * Module exports.
 * @public
 */

module.exports = {
    /**
     * Handles javacard.framework.AID api calls.
     */
    run: function(method, type, param, obj, objref, smartcard){
        switch (method) {
            case 0://void
                return this.constr(obj, param[0],param[1],param[2]);
            case 1://normal
                return this.RIDEquals(obj, param[0]);
            case 2:
                return this.equals(obj, param[0],param[1],param[2]);
            case 3:
                return this.getBytes(obj, param[0], param[1]);
            case 4:
                return this.PartialEquals(obj, param[0], param[1], param[2]);
            case 5:
                return this.getPartialEquals(obj, param[0],param[1],param[2],param[3]);//should be getPartialBytes?
            default:
                return new Error('Method ' + method + ' not defined for AID');
        }
    },

    AID: function(){
        this.AID = [];
        this.cls = 6;
    },
    constr: function(AID, bArray, offset, length){
        if (length < 5 || length > 16) {
            SystemException.throwIt(1);
        }
        if (bArray.length < offset + length) {
            ArrayIndexOutOfBoundsException.throwIt(offset + length);//TODO -> undefined
        }
        AID.AID = bArray.slice(offset, offset + length);
    },
    getBytes: function(AID, dest, soffset) {
        if (dest.length < soffset + AID.AID.length) {
            ArrayIndexOutOfBoundsException.throwIt(offset + AID.AID.length);
        }
        for(var j=0; j<AID.AID.length;j++) {
            dest[j+soffset] = theAID[j];
        }
        return AID.AID.length;
    },//01
    RIDEquals: function(AID, otherAID){
        return util.arraysEqual(AID.AID.slice(0,5), otherAID.AID.slice(0,5));
    },
    equals: function(AID, bArray, offset, length){
        if(bArray.length < offset + length) {
            ArrayIndexOutOfBoundsException.throwIt(offset + length);
        }
        return util.arraysEqual(AID.AID, bArray.slice(offset, offset + length)); 
    },
    partialEquals: function(AID, bArray, offset, length) {
        if(AID.AID.length < length)
            ArrayIndexOutOfBoundsException(length);
        if(bArray.length < offset + length)
            ArrayIndexOutOfBoundsException.throwIt(offset + length);
        return util.arraysEqual(AID.AID.slice(0,length), bArray.slice(offset, offset + length));
    },
    getPartialBytes: function(aidOffset,dest,oOffset,oLength) {
        if(oLength == 0)
            oLength = thisAID.length;
        if(dest.length < oOffset + oLength)
            ArrayIndexOutOfBoundsException.throwIt(oOffset + oLength);
        if(AID.AID.length < aidOffset + oLength)
            ArrayIndexOutOfBoundsException.throwIt(aidOffset + oLength);

        for(var j = 0; j<oLength;j++) {
            dest[oOffset+j] = theAID[aidOffset+j];
        }
        return oLength;
    }
}