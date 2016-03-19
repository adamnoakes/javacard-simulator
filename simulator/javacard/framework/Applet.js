/*!
 * Applet
 * @author Robin Williams
 * University of Southampton
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
                if(type === 6){//protected Applet();
                    return; //applet(obj);
                }
                //public equals()
                return new Error('Applet.equals() not implemented.');
            case 1:
                if(type === 3){
                    return registerJCPN(smartcard);
                }
                return;
            case 2://protected final register(BSB)
                //TODO-> register should use parameters.
                return register(param[0], param[1], param[2], smartcard);//ISSUE
            case 3://protected final selectingApplet() -> boolean
                return smartcard.RAM.selectStatementFlag;//obj.selectingApplet();
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

function register(bArray, bOffs, length, smartcard){
  var appletAID = bArray.slice(bOffs, bOffs + length);//smartcard.RAM.installingAppletAID;
  var installedApplets = smartcard.EEPROM.installedApplets;
  installedApplets[appletAID] = smartcard.RAM.gRef;
}

/**
 * Register from Java Card Platform Name
 *
 * @param smartcard
 */
function registerJCPN(smartcard){
    var appletAID = smartcard.RAM.installingAppletAID;//smartcard.RAM.installingAppletAID;
    var installedApplets = smartcard.EEPROM.installedApplets;
    installedApplets[appletAID] = smartcard.RAM.gRef;
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
}

exports.Applet = Applet;
