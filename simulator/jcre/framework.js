/*!
 * framework
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */

var applet = require('../javacard/framework/Applet.js');
var exceptions = require('../javacard/framework/Exceptions.js');
var aid = require('../javacard/framework/AID.js');
var jcSystem = require('../javacard/framework/JCSystem.js');
var ownerPIN = require('../javacard/framework/OwnerPIN.js');
var apdu = require('../javacard/framework/APDU.js');
var util = require('../javacard/framework/Util.js');

/**
 * Module exports.
 * @public
 */

module.exports = {

	/**
	 * Handles javacard.framework api calls.
	 *
	 * @param  {Number}    classToken The class token.
	 * @param  {Number}    method     The method token.
	 * @param  {Number}    type       The method type token.
	 * @param  {Array}     param      Params popped from operand stack.
	 * @param  {Object}    obj        The javacard.framework object.
	 * @param  {Smartcard} smartcard  The smartcard objet.
	 * @return 						            Error or the result of called function.
	 */
	run: function(classToken, method, type, param, obj, smartcard){
		switch(classToken){
			case 3://Applet abstract class
				return applet.run(method, type, param, obj, smartcard);
			case 4://CardException
			case 5://CardRuntimeException
				return exceptions.run(classToken, method, type, param, obj);
			case 6://AID
				return aid.run(method, type, param, obj);
			case 7://ISOException
				return exceptions.run(classToken, method, type, param, obj);
			case 8://JCSystem
				return jcSystem.run(method, type, param, obj, smartcard);
			case 9://OwnerPIN
				return ownerPIN.run(method, type, param, obj, smartcard);
			case 10://APDU
				return apdu.run(method, type, param, obj);
			case 11://PINException
			case 12://APDUException
			case 13://SystemException
			case 14://TransactionException
			case 15://UserException
				return exceptions.run(classToken, method, type, param, obj);
			case 16://Util
				return util.run(method, type, param, obj, smartcard);
			default:
				return new Error('Unsupported class');
		}
	},

	newObject: function(classToken){
		switch (classToken) {
			case 3:
        		return new applet.Applet();
      		case 6:
        		return new aid.AID();
      		case 9:
        		return new ownerPIN.OwnerPIN();
      		case 10:
        		return new apdu.APDU();
      		default:
        		return {};
    }
	}
};
