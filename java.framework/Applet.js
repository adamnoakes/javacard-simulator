


function Applet() {
    //Class Token - 03
    this.cls = 3;
    var appAID = "";
    
    //06-00 Constructor
    Applet.constr = function() 
    {
        //thePrivAccess = PrivAccess.getPrivAccess();
    }
    //06-01
    Applet.install = function(bArray, short, byte) {
        ISOException.throwIt(27265);
    }; 
    

    this.reg = function() {
        //01 Create Applet Instance
        //alert(gsAID);
        asyncState = false;
        cAppInstance(gsAID,gsAID);
        appAID = gsAID;
    }


    this.register = function (bRef, bOffset, bLength) {
        //02
        //var blen = getHeap(bRef);
        var bArray = [];
        for (var j = 0; j < bLength; j++) { bArray.push(getHeap(bRef + bOffset + j + 1)); }

        if (bLength < 5 || bLength > 16) {
            SystemException.throwIt(1);
        }
        var sAID = "";

        for (var j = 0; j < bLength; j++) {
            sAID += addpad(bArray[j]) + " ";
        }

        cAppInstance(gsAID, sAID);
        appAID = sAID;

    }

    function addpad(num) {
        var str = num.toString(16);
        if (str.length == 1) { str = "0" + str; };
        return str;
    }
    
    this.selectingApplet = function() {
        //03
        return select_statement_flag;
    }

    this.deselect = function() {
        //04

    }


    this.getShareableInterface = function(AID,byte) {
        //05
        return null;
    }

    this.select = function() {
        //06
        return true;
    }

    this.process= function(APDU) {
        //07

    }

    this.setAID = function (sAID) {

        appAID = sAID;
    }

    this.getAID = function () {

        return appAID;
    }


    this.restore = function (params) {

        appAID = params[0];

    }

    this.save = function () {

        var str = "f03/" + appAID;
        return str;
    }

}


 



