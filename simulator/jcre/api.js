/*!
 * api
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */

var framework = require('./framework.js');
var lang = require('./lang.js');
var security = require('./security.js');
var crypto = require('./crypto.js');
var opcodes = require('../utilities/opcodes.js');

/**
 * Module exports.
 * @public
 */

module.exports = {
	/**
	 * Handles all api calls and routes them to the releveant handlers.
	 *
	 * @param  {Array} packageAID     The package AID of the class being referenced.
	 * @param  {Number} classToken    The class token of the class being referenced.
	 * @param  {Number} method        The method token.
	 * @param  {Number} type          The method type token.
	 * @param  {Array}  param         Parameters popped from operand stack.
	 * @param  {Object} obj           The object if the method is being caleld on an object.
	 * @param  {SmartCard} smartcard  The smartcard object required for JCSystem
	 * @return 											  Error or the result of called function.
	 */
	run: function(packageAID, classToken, method, type, param, obj, smartcard){
		switch (packageAID.join()) {
			case opcodes.jlang.join():
				return lang.run(classToken, method, type, param, obj);
			case opcodes.jframework.join():
				return framework.run(classToken, method, type, param, obj, smartcard);
			case opcodes.jsecurity.join():
				return security.run(classToken, method, type, param, obj);
			case opcodes.jxcrypto.join():
				return crypto.run(classToken, method, type, param, obj);
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
	getNumberOfArguments: function(packageAID, classToken, method, type) {
	    //This function returns the number of argument required by the method
	    //is used to determine how many to pop from the operand stack
	    var obj;
	    //Framework
	    switch (packageAID.join()) {
	        case opcodes.jlang.join(): //lang
	          	switch (classToken) {
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
	            }
	            return new Error('Unsupported class');
	        case opcodes.jframework.join(): //Framework
	            switch (classToken) {
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
	                    if (method === 0)
							return 0;
						return 1;
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
						return 0;
	                case 7:  //ISOException
	                    if (method === 0) {
							return 0;
						} else {
							return 1;
						}
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
							break;
	                        case 6:
	                            return 0;
	                    }
						break;
	                case 11:  //PINException
	                case 12:  //APDUException
	                case 13:  //SystemException
	                case 14:  //TransactionException
	                case 15:  //UserException
						if (method === 0)
							return 0;
						return 1;
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
						break;
	            }
	            break;
	        case opcodes.jsecurity.join():
	        	switch(classToken){
					case 0://javacard/security/Key
					case 2://javacard/security/PrivateKey
					case 3://javacard/security/PublicKey
						switch(method){
							case 0: return 0;
							case 1: return 0;
							case 2: return 0;
							case 3: return 0;
						}
						break;
					case 7://javacard/security/RSAPrivateCrtKey
						switch(method) {
							case 0: return 0;
							  case 1: return 0;
							  case 2: return 0;
							  case 3: return 0;
							  case 4: return 2;
							  case 5: return 2;
							  case 6: return 2;
							  case 7: return 2;
							  case 8: return 2;
							  case 9: return 3;
							  case 10: return 3;
							  case 11: return 3;
							  case 12: return 3;
							  case 13: return 3;
							}
						break;
					case 8://javacard/security/RSAPrivateKey
					case 9://javacard/security/RSAPublicKey
						switch(method) {
							case 0:
							case 1:
							case 2:
							case 3:
								return 0;
							case 4:
							case 5:
								return 2;
							case 6:
							case 7:
								return 3;
						}
						break;
					case 11:
						console.log('type ' + type);
						switch(type){
					  		case 6://CONSTANT_StaticMethodref
					    		return 2;
					  		case 3://public abstract
				   				switch (method) {
									case 1://doFinal
										return 5;
									case 2://getAlgorithm
										return 0;
									case 3://getLength
										return 0;
									case 4://reset
										return 0;
									case 5: //update
										return 3;
								}
								break;
						}
						break;
					case 13://javacard/security/KeyBuilder
						switch(method) {
							case 0://TODO -> equals is also 0 and requires 1 param
								return 3;
						}
						break;
					case 16://javacard/security/KeyPair
						switch(method) {
							case 0:
								return 1;
							  case 1:
							  case 2:
							  case 3:
								return 0;
						}
						break;
				}
				break;
	        case opcodes.jxcrypto.join():
	        	switch(classToken){
					case 1://javacard/crypto/Cipher
		            	switch(method) {
			        		case 0:
			        			return 2;//TODO -> equals is also 0 and requires 1 param
			                case 1:
			                	return 5;
			                case 2:
			                	return 0;
			                case 3:
			                	return 2;
			                case 4:
			                	return 5;
			                case 5:
			                	return 5;
						}
						break;
				}
				break;
	    }
		return new Error('getNumberOfArguments has not been defined for Method ' +
			method + ' in class ' + classToken + ', package AID: ' + packageAID);
	}
};
