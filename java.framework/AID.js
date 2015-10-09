function AID()
{
    //Class Token - 06
    
   
    var theAID = [];
    AID.thisAID = theAID;

    this.cls = 6;
    
    AID.constr = function (bArray, offset, length) {
        if (length < 5 || length > 16) { SystemException.throwIt(1); };
        if (bArray.length < offset + length) { ArrayIndexOutOfBoundsException.throwIt(offset + length) };
        for (var j = 0; j < length; j++) {
            theAID.push(bArray[offset + j]);
        }

    };


    ////0
    //this.eq() = function (anObject) {

    //    if (anObject == null) { return false; }
    //    var compare = true;
    //    if (theAID.length == anObject.thisAID.length) {
    //        for (var j = 0; j < theAID.length; j++) {
    //            if (theAID[j] != anObject.thisAID[j]) { compare = false; break; }
    //        }

    //    } else { compare = false };
    //    return compare;
    //}



    //03
    this.getBytes = function(dest,soffset) {
        if (dest.length < soffset + theAID.length) { ArrayIndexOutOfBoundsException.throwIt(offset + length) };
        
        for(var j=0; j<theAID.length;j++) {
            dest[j+soffset] = theAID[j];
        }

        return theAID.length;
    }



    //01
    this.RIDEquals = function (otherAID) {
        var compare = true;
        //RID is the first 5 bytes of the AID
        for (var j = 0; j < 5; j++) {
            if (theAID[j] != otherAID.thisAID[j]) { compare = false; break; }
        }
        return compare;

    }
    //02
    this.equals = function(bArray, offset, length) {
        if(bArray.length < offset + length) {ArrayIndexOutOfBoundsException.throwIt(offset + length)};

        var compare = true;
        if(theAID.length == bArray.length) {
            for (var j = 0; j<theAID.length; j++) {
                if(theAID[j] != bArray[j+offset]) {compare = false; break;}
            }

        } else {compare = false};
        return compare;

    }

    //04
    this.partialEquals = function(bArray, offset, length) {
        if(bArray.length < offset + length) {ArrayIndexOutOfBoundsException.throwIt(offset + length)};
        if(length > theAID.length) {
            return false;
        } else {
            var compare = true;
            
            for (var j = 0; j<length; j++) {
                if(theAID[j] != bArray[j+offset]) {compare = false; break;}
            }
            return compare;
        }

    }


    //05
    this.getPartialBytes = function(aidOffset,dest,oOffset,oLength) {
        if(oLength == 0) {oLength = thisAID.length};
        if(dest.length < oOffset + oLength) {ArrayIndexOutOfBoundsException.throwIt(oOffset + oLength)}
        if (theAID.length < aidOffset + oLength) { ArrayIndexOutOfBoundsException.throwIt(aidOffset + oLength) }

        for(var j = 0; j<oLength;j++) {
            dest[oOffset+j] = theAID[aidOffset+j];
        }
        return oLength;

    }

    this.restore = function (params) {

        AID.thisAID = params[0];
        theAID = params[1];

    }

    this.save = function () {

        var str = "f06/" + AID.thisAID + "/" + theAID;
        return str;
    }


}