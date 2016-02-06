/*!
 * framework
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */

var applet = require('../framework/Applet.js');
var exceptions = require('../framework/Exceptions.js');
var aid = require('../framework/AID.js');
var jcSystem = require('../framework/JCSystem.js');
var ownerPIN = require('../framework/OwnerPIN.js');
var apdu = require('../framework/APDU.js');
var util = require('../framework/Util.js');

/**
 * Module exports.
 * @public
 */

module.exports = {
	/**
	 * Handles javacard.framework api calls.
	 */
	run: function(clas, method, type, param, obj, objref, smartcard){
		switch(clas){
			case 3://Applet abstract class
				return applet.run(method, type, param, obj, objref, smartcard);
			case 4://CardException
			case 5://CardRuntimeException
				return exceptions.run(clas, method, type, param, obj, objref, smartcard);
			case 6://AID
				return aid.run(method, type, param, obj, objref, smartcard);
			case 7://ISOException
				return exceptions.run(clas, method, type, param, obj, objref, smartcard);
			case 8://JCSystem
				return jcSystem.run(method, type, param, obj, objref, smartcard);
			case 9://OwnerPIN
				return ownerPIN.run(method, type, param, obj, objref, smartcard);
			case 10://APDU
				return apdu.run(method, type, param, obj, objref, smartcard);
			case 11://PINException
			case 12://APDUException
			case 13://SystemException
			case 14://TransactionException
			case 15://UserException
				return exceptions.run(clas, method, type, param, obj, objref, smartcard);
			case 16://Util
				return util.run(method, type, param, obj, objref, smartcard);
			default:
				return new Error('Unsupported class');
		}
	}
};