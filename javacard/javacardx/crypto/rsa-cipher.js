/*!
 * rsa-cipher
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */

var cipher = require('./cipher.js');
var Util = require('../../framework/Util.js');
var arrayToLong = require('../../security/keys.js').arrayToLong;

/**
 * Module exports.
 * @public
 */

module.exports = {
	RSACipher: function(algorithm){
		//RSACipher extends Cipher
		cipher.Cipher(this, algorithm);
	},
	init: function(self, RSAKey, mode, bArray = [], bOff = 0, bLen = 0){
		//if theKey is not isinstance of RSAPrivateKey/ RSAPublicKey/ RSAPrivateCRTKey
        //raise CryptoException(CryptoException.ILLEGAL_VALUE)
        if(!keys.isInitialized(theKey)){
        	//throw CryptoException(CryptoException.UNINITIALIZED_KEY)
        } else if(mode != this.MODE_ENCRYPT || mode != this.MODE_DECRYPT){
        	//throw CryptoException(CryptoException.ILLEGAL_VALUE)
        }
        cipher.mode = mode;
        cipher.key = RSAKey;
        cipher.initialized = true;
	},
	/**
	 * Perform cipher. Encryption or decryption is defined by mode.
	 * @return {[type]} [description]
	 */
	doFinal: function(cipherObj, inBuff, inOffset, inLength, outBuff, outOffset){
		if(!cipherObj.initialized){
			//throw CryptoException(CryptoException.INVALID_INIT)
		}
		var data;
		var result;
		data = new Array(len).fill(0);
		Util.arrayCopyNew(inBuff, inOffset, data, 0, inLength);

		if(data.length != Math.floor(cipherObj.key.size / 8)){
			//throw ryptoException(CryptoException.ILLEGAL_VALUE)
		}

		if(cipherObj.mode === cipher.MODE_ENCRYPT){
			//encrypt with node-rsa
			if(cipherObj.key.private){
				result = longToArray(cipherObj.key.key.encryptPrivate(arrayToLong(data)));
			} else {
				result = longToArray(cipherObj.key.key.encrypt(arrayToLong(data)));
			}
		} else if (cipherObj.mode === cipher.MODE_DECRYPT){
			if(cipherObj.key.private){
				result = longToArray(cipherObj.key.key.decrypt(arrayToLong(data)));
			} else {
				/**
				 * "We are actually verifying, which can be done the same way
				 *  as encrypting..." - need to verify this.
				 */
				result = longToArray(cipherObj.key.key.encrypt(arrayToLong(data)));
			}
		}

		Util.arrayCopyNew(result, 0, outBuff, outOffset, result.length);
		return result.length;
	}
};