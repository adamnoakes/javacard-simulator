/*!
 * AID (Class token: 6)
 *
 * This class encapsulates the Application Identifier (AID) associated with an
 * applet. An AID is defined in ISO 7816-5 to be a sequence of bytes between 5
 * and 16 bytes in length.
 *
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var util = require('./Util.js');
var e = require('./Exceptions.js');
var le = require('../lang/exceptions.js');
/**
 * Module exports.
 * @public
 */

module.exports = {
    /**
     * Handles javacard.framework.AID api calls.
     *
     * @param  {Number} method The method token
     * @param  {Number} type   The method type token
     * @param  {Array}  param  Popped from operand stack
     * @param  {AID}    obj    The AID object
     * @return                 Error or the result of called function.
     */
    run: function(method, type, param, obj){
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
    /**
     * Called on new keyword.
     * @constructor
     */
    AID: function(){
        this.AID = [];
        this.cls = 6;
    },
    /**
     * The Java Card runtime environment uses this constructor
     * to initialise an AID instance encapsulating the specified AID bytes.
     *
     * @param  {AID}    AID    The AID object
     * @param  {Array}  bArray The byte array containing the AID bytes
     * @param  {Number} offset The start of AID bytes in bArray
     * @param  {Length} length The length of the AID bytes in bArray
     * @return {void}
     */
    constr: function(AID, bArray, offset, length){
        if (length < 5 || length > 16) {
            return e.getSystemException(1);
        }
        if (bArray.length < offset + length) {
            return le.getArrayIndexOutOfBounds();
        }
        AID.AID = bArray.slice(offset, offset + length);
    },

    /**
     * Called to get all the AID bytes encapsulated within AID object.
     *
     * @param  {AID}    AID     The AID object
     * @param  {Array}  dest    Byte array to copy the AID bytes
     * @param  {Number} soffset Within dest where the AID bytes begin
     * @return {Number}         The length of the AID bytes
     */
    getBytes: function(AID, dest, soffset) {
        if(!(dest instanceof Array)){
            return le.getNullPointer();
        }
        if (dest.length < soffset + AID.AID.length) {
            return le.getArrayIndexOutOfBounds();
        }
        for(var j=0; j<AID.AID.length;j++) {
            dest[j+soffset] = theAID[j];
        }
        return AID.AID.length;
    },//01

    /**
     * Checks if the RID (National Registered Application provider identifier)
     * portion of the encapsulated AID bytes within the otherAID object matches
     * that of the AID object.
     *
     * @param  {AID} AID      The AID object
     * @param  {AID} otherAID The AID object to compare against
     * @return {Boolean}
     */
    RIDEquals: function(AID, otherAID){
        return util.arraysEqual(AID.AID.slice(0,5), otherAID.AID.slice(0,5));
    },

    /**
     * Checks if the specified AID bytes in bArray are the same as those
     * encapsulated in this AID object. The result is true if and only if the
     * bArray argument is not null and the AID bytes encapsulated in this AID
     * object are equal to the specified AID bytes in bArray.
     *
     * @param  {AID}     AID     The AID object
     * @param  {Array}   bArray  Containing the AID bytes
     * @param  {Number}  offset  Within bArray to begin
     * @param  {Number}  length  Of AID bytes in bArray
     * @return {Boolean}
     */
    equals: function(AID, bArray, offset, length){
        if(bArray.length < offset + length) {
            return le.getArrayIndexOutOfBounds(offset + length);
        }
        return util.arraysEqual(AID.AID, bArray.slice(offset, offset + length));
    },

    /**
     * Checks if the specified partial AID byte sequence matches the first
     * length bytes of the encapsulated AID bytes within this AID object.
     *
     * @param  {AID}    AID    The AID object
     * @param  {Array}  bArray Containing the partial AID byte sequence
     * @param  {Number} offset Within bArray to begin
     * @param  {Number} length Of partial AID bytes in bArray
     * @return {Boolean}
     */
    partialEquals: function(AID, bArray, offset, length) {
        if(AID.AID.length < length)
            return le.getArrayIndexOutOfBounds(length);
        if(bArray.length < offset + length)
            return le.getArrayIndexOutOfBound(offset + length);
        return util.arraysEqual(AID.AID.slice(0,length), bArray.slice(offset, offset + length));
    },

    /**
     * Called to get part of the AID bytes encapsulated within the AID object
     * starting at the specified offset for the specified length.
     * @param  {[type]} aidOffset [description]
     * @param  {[type]} dest      [description]
     * @param  {[type]} oOffset   [description]
     * @param  {[type]} oLength   [description]
     * @return {[type]}           [description]
     */
    //TODO -> does not work
    getPartialBytes: function(aidOffset,dest,oOffset,oLength) {
        if(oLength === 0)
            oLength = thisAID.length;
        if(dest.length < oOffset + oLength)
            return le.getArrayIndexOutOfBounds(oOffset + oLength);
        if(AID.AID.length < aidOffset + oLength)
            return le.getArrayIndexOutOfBounds(aidOffset + oLength);

        for(var j = 0; j<oLength;j++) {
            dest[oOffset+j] = theAID[aidOffset+j];
        }
        return oLength;
    }
};
