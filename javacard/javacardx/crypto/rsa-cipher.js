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
var keys = require('../../security/keys.js');

/**
 * Module exports.
 * @public
 */

module.exports = {
	RSACipher: function(algorithm){
		//RSACipher extends Cipher
		cipher.Cipher(this, algorithm);
	},
	//should be bArray = [], bOff = 0, bLen = 0
	init: function(cipher, RSAKey, mode, bArray , bOff, bLen){
		//if theKey is not isinstance of RSAPrivateKey/ RSAPublicKey/ RSAPrivateCRTKey
        //raise CryptoException(CryptoException.ILLEGAL_VALUE)
        if(!keys.isInitialized(RSAKey)){
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
		data = Array.apply(null, Array(inLength)).map(Number.prototype.valueOf,0);//new Array(inLength).fill(0);
		Util.arrayCopyNew(inBuff, inOffset, data, 0, inLength);
		if(data.length != Math.floor(cipherObj.key.size / 8)){
			//throw ryptoException(CryptoException.ILLEGAL_VALUE)
		}
		if(cipherObj.mode === cipher.MODE_ENCRYPT){
			//encrypt with node-rsa
			if(cipherObj.key.private){
				result = Array.prototype.slice.call(cipherObj.key.key.encryptPrivate(new Buffer(data)), 0);
			} else {
				result = Array.prototype.slice.call(cipherObj.key.key.encrypt(new Buffer(data)), 0);
			}
		} else if (cipherObj.mode === cipher.MODE_DECRYPT){
			if(cipherObj.key.private){
				result = Array.prototype.slice.call(cipherObj.key.key.decrypt(new Buffer(data)), 0);
			} else {
				result =  Array.prototype.slice.call(cipherObj.key.key.decryptPrivate(new Buffer(data)), 0);
			}
		}

		//console.log(result);
		Util.arrayCopyNew(result, 0, outBuff, outOffset, result.length);
		return result.length;
	}
};