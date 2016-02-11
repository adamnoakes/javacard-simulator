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
var rsaPublicKey = require('../../security/rsa-public-key.js');
var rsaPrivateCrtKey = require('../../security/rsa-private-crt-key.js');

/**
 * Module exports.
 * @public
 */

module.exports = {

	run: function(cipher, method, methodType, param, smartcard){
		switch(method){
			case 0://equals
				if(param.length === 2){
					return new this.RSACipher(param[0], param[1]);
				}
				return new Error('Equals not implemented');
			case 1://doFinal
				return this.doFinal(cipher, param[0], param[1], param[2], param[3], param[4]);
			case 2:
				return this.getAlgorithm(cipher);
			case 3:
				return this.init(cipher, param[0], param[1], [], 0, 0);
			case 4:
				return this.init(cipher, param[0], param[1], param[2], param[3], param[4]);
			case 5:
			default:
				return new Error('Method ' + method + ' not defined for RSACipher');
				//throw error, cannot perform method method, methodType methodType
		}
	},
	RSACipher: function(algorithm){
		//RSACipher extends Cipher
		cipher.Cipher(this, algorithm);
	},
	//should be bArray = [], bOff = 0, bLen = 0
	init: function(cipherObj, RSAKey, mode, bArray , bOff, bLen){
		//if theKey is not isinstance of RSAPrivateKey/ RSAPublicKey/ RSAPrivateCRTKey
        //raise CryptoException(CryptoException.ILLEGAL_VALUE)
        if(!keys.isInitialized(RSAKey)){
        	//throw CryptoException(CryptoException.UNINITIALIZED_KEY)
        } else if(mode != cipher.MODE_ENCRYPT || mode != cipher.MODE_DECRYPT){
        	//throw CryptoException(CryptoException.ILLEGAL_VALUE)
        }
		cipherObj.mode = mode;
		cipherObj.key = RSAKey;
		cipherObj.initialized = true;
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
		var nodeRSA;
		data = Array.apply(null, Array(inLength)).map(Number.prototype.valueOf,0);//new Array(inLength).fill(0);
		require('../../framework/Util.js').arrayCopyNonAtomic(inBuff, inOffset, data, 0, inLength);
		if(data.length != Math.floor(cipherObj.key.size / 8)){
			//throw ryptoException(CryptoException.ILLEGAL_VALUE)
		}

		if(cipherObj.key.private){
			nodeRSA = rsaPrivateCrtKey.getNodeRSA(cipherObj.key);
			if(cipherObj.mode === cipher.MODE_ENCRYPT){
				result = Array.prototype.slice.call(nodeRSA.encryptPrivate(new Buffer(data)), 0);
			} else if (cipherObj.mode === cipher.MODE_DECRYPT){
				result = Array.prototype.slice.call(nodeRSA.decrypt(new Buffer(data)), 0);
			}
		} else {
			nodeRSA = rsaPublicKey.getNodeRSA(cipherObj.key);
			if(cipherObj.mode === cipher.MODE_ENCRYPT){
				result = Array.prototype.slice.call(nodeRSA.encrypt(new Buffer(data)), 0);
			} else if (cipherObj.mode === cipher.MODE_DECRYPT){
				result =  Array.prototype.slice.call(nodeRSA.decryptPublic(new Buffer(data)), 0);
			}
		}
		outBuff.length = outOffset + result.length;
		for(var i =0; i < outOffset; i++){
			outBuff[i] = 0;
		}
		//console.log(result);
		require('../../framework/Util.js').arrayCopyNonAtomic(result, 0, outBuff, outOffset, result.length);
		return result.length;
	}
};