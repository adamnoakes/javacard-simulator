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
	run: function(classToken, method, type, param, obj, objref, smartcard){
		switch(classToken){
			case 0://javacard/security/Key
                return keys.run(obj, method, type, param);
            case 1://javacard/security/DSAKey
            	return new Error('Unsupported class');
            case 2://javacard/security/PrivateKey
                return keys.run(obj, method, type, param);
            case 3://javacard/security/PublicKey
                return keys.run(obj, method, type, param);
            case 4://javacard/security/SecretKey
            case 5://javacard/security/DSAPrivateKey
            case 6://javacard/security/DSAPublicKey
            case 7://javacard/security/RSAPrivateCrtKey
            	return new Error('Unsupported class');
            case 8://javacard/security/RSAPrivateKey
            	return rsaPrivateKey.run(obj, method, type, param);
            case 9://javacard/security/RSAPublicKey
            	return rsaPublicKey.run(obj, method, type, param);
            case 10://javacard/security/DESKey
            case 11://javacard/security/MessageDigest
            case 12://javacard/security/CryptoException
           		return new Error('Unsupported class');
            case 13://javacard/security/KeyBuilder
            	return keyBuilder.run(obj, method, type, param);
            case 14://javacard/security/RandomData
            case 15://javacard/security/Signature
            	return new Error('Unsupported class');
            case 16://javacard/security/KeyPair
            	return keyPair.run(obj, method, type, param);
            case 17://javacard/security/ECKey
            case 18://javacard/security/ECPrivateKey
            case 19://javacard/security/ECPublicKey
            case 20://javacard/security/AESKey
            case 21://javacard/security/Checksum
            case 22://javacard/security/KeyAgreement
            case 23://javacard/security/HMACKey
            case 24://javacard/security/KoreanSEEDKey
            case 25://javacard/security/SignatureMessageRecovery
            case 25://javacard/security/InitializedMessageDigest
            	return new Error('Unsupported class');
			default:
				return new Error('Unsupported class');
		}
	},

	newObject: function(classToken){
		switch (classToken) {
            default:
                return new Error('Unsupported Object');
        }
	}
};