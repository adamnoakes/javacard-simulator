// 09

function OwnerPIN() {
    

    var tryLimit = 0;
    var maxPINSize = 0;
    var pinValue = [];
    var pinSize = 0;
    var flags = [0]; //bool
    var VALIDATED = 0;
    var NUMFLAGS = 1;
    var triesLeft = 0;
    this.cls = 9;



    function getValidatedFlag() {
        return flags[0];
    }

    function setValidatedFlag(value) {
        flags[0] = value;
    }

    function resetTriesRemaining() {
        triesLeft = tryLimit;
    }

    function decrementTriesRemaining() {
        triesLeft--;
    }

    //06-00
    this.constr = function(tryLimitb,maxPINSizeb) {
        if(tryLimitb < 1 || maxPINSizeb < 1) {PINException.throwIt(1);}
        tryLimit = tryLimitb;
        maxPINSize = maxPINSizeb;

        pinSize = maxPINSize;
        triesLeft = tryLimit;
    }
    

    //01
    this.check = function(pin, offset, length)
    {
        alert(pin + "," + offset + "," + length);
        var noMoreTries = false;
        setValidatedFlag(0);
        if(this.getTriesRemaining() == 0) {
            noMoreTries = true;}
        else {
            decrementTriesRemaining(); }
        
        if(length != pinSize || noMoreTries) {return 0;}
        
        var compare = true;
        
        if(length > 0) { 
            for (var j = 0; j < length; j++) {
                alert(arrload(pin, j + offset) + ";" + pinValue[j]);
                if(arrload(pin,j+offset) != pinValue[j]) {compare = false;}
            }
        }

        if(compare) {
            setValidatedFlag(1);
            resetTriesRemaining(); return 1
        } else { return 0;}
    }

    //02
    this.getTriesRemaining = function () {
        return triesLeft;
    }

    //04
    this.isValidated = function() {
        return getValidatedFlag();

    }

    //05
    this.reset = function () {
        if(this.isValidated()) {
            this.resetAndUnblock(); }
    }

    //06
    this.resetAndUnblock = function () {
        resetTriesRemaining();
        setValidatedFlag(0);
    }

    //08
    this.update = function (pin, offset, length) {
        if (length > maxPINSize) { PINException.throwIt(1); }

        for(var j=0;j<length;j++) {
            pinValue[j] = Number(arrload(pin, j+offset));
        }
        
        pinSize = length;
        triesLeft = tryLimit;
        setValidatedFlag(0);
        
    }

    
    this.restore = function (params) {

        tryLimit = params[0];
        maxPINSize = Number(params[1]);
        pinValue = params[2];
        flags = params[3];
        VALIDATED = params[4]; 
        NUMFLAGS = params[5];
        triesLeft = params[6];
        pinSize = params[7];
    }

    this.save = function () {

        var str = "f09/" + tryLimit + "/" + maxPINSize + "/" +
            pinValue + "/" + flags + "/" + VALIDATED + "/" +
            NUMFLAGS + "/" + triesLeft + "/" + pinSize;
        return str;

    }



}




