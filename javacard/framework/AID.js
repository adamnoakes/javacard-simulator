var util = require('./Util.js');
//Class Token - 06
module.exports = {
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