/*!
 * api
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */

var framework = require('./framework.js');
var lang = require('./lang.js');
var opcodes = require('../utilities/opcodes.js');

/**
 * Module exports.
 * @public
 */

module.exports = {
	run: function(packageAID, classToken, method, type, param, obj, objref, smartcard){
		switch (packageAID.join()) {
			case opcodes.jlang.join():
				return lang.run(classToken, method, type, param, obj);
			case opcodes.jframework.join():
				return framework.run(classToken, method, type, param, obj, objref, smartcard);
			case opcodes.jsecurity.join():

			case opcodes.jxcrypto.join():
				return new Error('Unsupported package');
			default:
				return new Error('Unsupported package');
		}
	},
	newObject: function(packageAID, classToken){
		switch (packageAID.join()) {
			case opcodes.jlang.join():
				return lang.newObject(classToken);
			case opcodes.jframework.join():
				return framework.newObject(classToken);
			case opcodes.jsecurity.join():

			case opcodes.jxcrypto.join():
				return new Error('Unsupported package');
			default:
				return new Error('Unsupported package');
		}
	},
	/**
	 * Robin William's code:
	 */
	getNumberOfArguments: function(packageAID, clas, method, type) {
	    //This function returns the number of argument required by the method
	    //is used to determine how many to pop from the operand stack
	    var obj;
	    //Framework
	    switch (packageAID.join()) {
	        case opcodes.jlang.join(): //lang
	            switch (clas) {
	                case 0:  //Object
	                case 1:  //Throwable
	                case 2:  //Exception
	                case 3:  //RuntimeException
	                case 4:  //IndexOutOfBoundsException 
	                case 5:  //ArrayIndexOutOfBoundsException
	                case 6:  //NegativeArraySizeException
	                case 7:  //NullPointerException
	                case 8:  //ClassCastException
	                case 9:  //ArithmeticException
	                case 10:  //SecurityException
	                case 11:  //ArrayStoreException
	                    return 0;
	                default:
	                    return new Error('Unsupported class');
	            }

	            break;
	        case opcodes.jframework.join(): //Framework

	            switch (clas) {
	                case 3:  //Applet

	                    switch (method) {
	                        case 2:
	                            return 3;
	                        case 5:
	                            return 2;
	                        case 7:
	                            return 1;
	                        default:
	                            return 0;
	                    }

	                    break;
	                case 4:  //CardException
	                case 5:  //CardRuntimeException
	                    if (method == 0) { return 0; } else { return 1; }
	                case 6:  //AID
	                    switch (method) {
	                        case 0:
	                            return 1;
	                        case 1:
	                            return 1;
	                        case 2:
	                            return 3;
	                        case 3:
	                            return 2;
	                        case 4:
	                            return 3;
	                        case 5:
	                            return 4;
	                    }
	                case 7:  //ISOException
	                    if (method == 0) { return 0; } else { return 1; }
	                    break;
	                case 8:  //JCSystem
	                    switch (method) {
	                        case 12:
	                            return 2;
	                        case 13:
	                            return 2;
	                        case 14:
	                            return 2;
	                        case 15:
	                            return 2;
	                        default:
	                            return 0;
	                    }
	                    break;
	                case 9:  //OwnerPIN
	                    switch (method) {
	                        case 0:
	                            return 2;
	                        case 1:
	                            return 3;
	                        case 8: 
	                            return 3;
	                        default:
	                            return 0;

	                    }


	                    break;
	                case 10:  //APDU
	                    switch (type) {
	                        case 3:
	                            switch (method) {
	                                case 0:
	                                    return 1;
	                                case 3:
	                                    return 1;
	                                case 4:
	                                    return 2;
	                                case 5:
	                                    return 3;
	                                case 8:
	                                    return 2;
	                                case 9:
	                                    return 1;
	                                default:
	                                    return 0;
	                            }
	                        case 6:
	                            return 0;

	                    }

	                case 11:  //PINException
	                case 12:  //APDUException
	                case 13:  //SystemException
	                case 14:  //TransactionException
	                case 15:  //UserException
	                    if (method == 0) { return 0; } else { return 1; }
	                case 16:  //Util

	                    switch(method) {
	                        case 1: return 5;
	                        case 2: return 5;
	                        case 3: return 5;
	                        case 4: return 4;
	                        case 5: return 2;
	                        case 6: return 3;
	                        case 7: return 3;
	                    }
	                default:
	                    return new Error('Unsupported class');
	            }

	            break;
	        case opcodes.jsecurity.join():
	        case opcodes.jxcrypto.join():
	        default:
	            return new Error('Unsupported package' + packageAID);
	    }
	}
};