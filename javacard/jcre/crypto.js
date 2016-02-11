/*!
 * crypto
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var cipher = require('../javacardx/crypto/cipher.js');
var rsaCipher = require('../javacardx/crypto/rsa-cipher.js');

/**
 * Module exports.
 * @public
 */

module.exports = {
	/**
	 * Handles javacard.security api calls.
	 */
	run: function(classToken, method, type, param, obj, objref, smartcard){
		switch(classToken){
            case 0://javacardx/crypto/KeyEncryption
                return new Error('Unsupported class: KeyEncryption');
			case 1://javacard/crypto/Cipher
                return cipher.run(obj, method, type, param);
			default:
				return new Error('Unsupported class for javacardx.crypto');
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