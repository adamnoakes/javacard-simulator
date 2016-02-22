/*!
 * Applet
 * @author Robin Williams
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var eeprom = require('../../smartcard/eeprom.js');
var ram = require('../../smartcard/ram.js');
var e = require('./Exceptions.js');

/**
 * Module exports.
 * @public
 */

//This class is not really used.
module.exports = {
    /**
     * Handles javacard.framework.Applet api calls
     *
     * @param  {Number} method The method token
     * @param  {Number} type   The method type token
     * @param  {Array}  param  Popped from operand stack
     * @param  {Applet} obj    The Applet object
     * @return                 Error or the result of called function.
     */
    run: function(method, type, param, obj, smartcard){
        switch(method){
            case 0:
                if(param.length === 0){//protected Applet();
                    return Applet.constr(); //applet(obj);
                }
                //public equals()
                return new Error('Applet.equals() not implemented.');
            case 1:
                //if(param){//public static install(BSB)
                    return addInstalledApplet(smartcard);
                //}
                //protected final register()
                //not implmented

            case 2://protected final register(BSB)
                //TODO-> register should use parameters.
                return addInstalledApplet(smartcard);//ISSUE
                //obj.register(param[0], param[1], param[2]);
            case 3://protected final selectingApplet() -> boolean
                return ram.getSelectStatementFlag(smartcard.RAM);//obj.selectingApplet();
            case 4://public deselect()
            case 5://public getShareableInterfaceObject(clientAID, parameter) -> Shareable
            case 6://public select() -> boolean
            case 7://public abstract process(APDU) -> void
                return;
            default:
                return new Error('Method not defined');
        }
    },
    Applet: Applet
};

function addInstalledApplet(smartcard){
  var appletAID = smartcard.RAM.installingAppletAID;
  var gRef = smartcard.RAM.gRef;
	var installedApplets = smartcard.EEPROM.installedApplets;
  installedApplets.push({'AID': appletAID, 'appletRef': gRef, 'heap': smartcard.RAM.heap});
}
/**
 * ADAM'S CODE ENDS HERE
 */

//this code does not do what it should and should probably be refactors
//not a priority.

/**
 * ROBIN WILLIAM'S CODE
 */
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
        return e.getISOException(27265);
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
            return e.getSystemException(1);
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
    /*
     * @adam May never be used? Removing select_statement_flag
     */
    /*this.selectingApplet = function() {
        //03
        return select_statement_flag;
    }*/

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
}

exports.Applet = Applet;
