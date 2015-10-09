
function Util() {
    //Class Token - 10
    //Util.Token = 0x10;

    Util.arrayCompare = function (src, srcOff, dest, destOff, length) {

        try {
            
            for (var j = 0; j < length; j++) {
 
                if (arrload(src, srcOff + j) > arrload(dest, destOff + j)) {
                    return 1;
                } else if (arrload(src, srcOff + j) > arrload(dest, destOff + j)) {
                    return -1;
                }
            }
        } catch (err) {

            return 2;
        }
        return 0;
    }; //00 byte

    Util.arrayCopy = function (src, srcOff, dest, destOff, length) {
        JCSystem.beginTransaction();
        try{
            for (var j = 0; j < length; j++) {
                arrstore(dest, destOff + j, arrload(src, srcOff + j));
            }
        } catch (err) {
            JCSystem.abortTransaction();
            //throw "ArrayOutofBoundsException";
            return 0;
        }
        JCSystem.commitTransaction();
        return 1;
    }; //01 short

    Util.arrayCopyNonAtomic = function (src, srcOff, dest, destOff, length) {
        
        try {
            for (var j = 0; j < length; j++) {
                arrstore(dest, destOff + j, arrload(src, srcOff + j));
                //alert(arrload(src, srcOff + j));
            }
        } catch (err) {
            //throw "ArrayOutofBoundsException";
            return 0;
        }
    }; //02 short

    Util.arrayFillNonAtomic = function (bArray, bOff, bLen, bValue) {
        try {
            for (var j = 0; j < length; j++) {
                arrstore(bArray, bOff + j, bValue);
            }
        } catch (err) {
            return 0;
            //throw "ArrayOutofBoundsException";
        }
        return 1;

    }; //03 short
    Util.getShort = function (bArray, bOff) {
        Util.makeShort(arrload(bArray, bOff), arrload(bArray, bOff+1));
        return 1;
    }; //04 short
    Util.makeShort = function (b1, b2) {
        return (((b1 << 8) & 0xFF00) | (b2 & 0xFF))
    } //05 short
    Util.setShort = function (bArray, bOff, sValue) {
        var b1 = ((sValue & 0xFF00) >> 8);
        var b2 = (sValue & 0xFF);
        try {
            //alert(bArray + " " + bOff + " " + sValue);
            arrstore(bArray, bOff, b1);
            arrstore(bArray, bOff+1, b2)
        } catch (err) {
            return 0;
            //throw "ArrayOutofBoundsException";
        }
        return 1;
    }; //06 short
    

    


}