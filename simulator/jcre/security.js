/*!
 * security
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */

var keys = require('../javacard/security/keys.js');
var rsaPrivateKey = require('../javacard/security/rsa-private-key.js');
var rsaPrivateCrtKey = require('../javacard/security/rsa-private-crt-key.js');
var rsaPublicKey = require('../javacard/security/rsa-public-key.js');
var keyBuilder = require('../javacard/security/key-builder.js');
var keyPair = require('../javacard/security/key-pair.js');
var messageDigest = require('../javacard/security/message-digest.js');
/**
 * Module exports.
 * @public
 */

module.exports = {
	/**
	 * Handles javacard.security api calls.
	 */
	run: function(classToken, method, type, param, obj){
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
            	return rsaPrivateCrtKey.run(obj, method, type, param);
            case 8://javacard/security/RSAPrivateKey
            	return rsaPrivateKey.run(obj, method, type, param);
            case 9://javacard/security/RSAPublicKey
            	return rsaPublicKey.run(obj, method, type, param);
            case 10://javacard/security/DESKey
            case 11://javacard/security/MessageDigest
				return messageDigest.run(obj, method, type, param);
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
            case 16:
                return new keyPair.KeyPair();
            default:
                return new Error('Unsupported Object');
        }
    }
};
