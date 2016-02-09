/*!
 * cipher
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */


var keys = require('../../security/keys.js');

/**
 * Module exports.
 * @public
 */

module.exports = {

	/**
	 * Constants.
	 */
	
	ALG_DES_CBC_NOPAD: 1,
	ALG_DES_CBC_ISO9797_M1: 2,
	ALG_DES_CBC_ISO9797_M2: 3,
	ALG_DES_CBC_PKCS5: 4,
	ALG_DES_ECB_NOPAD: 5,
	ALG_DES_ECB_ISO9797_M1: 6,
	ALG_DES_ECB_ISO9797_M2: 7,
	ALG_DES_ECB_PKCS5: 8,
	ALG_RSA_ISO14888: 9, //adds pad according to ISO14888
	ALG_RSA_PKCS1: 10,	//adds pad according to PKCS1
	ALG_RSA_ISO9796: 11, //deprecated
	ALG_RSA_NOPAD: 12,	//no padding
	ALG_AES_BLOCK_128_CBC_NOPAD: 13,
	ALG_AES_BLOCK_128_ECB_NOPAD: 14,
	ALG_RSA_PKCS1_OAEP: 15,
	ALG_KOREAN_SEED_ECB_NOPAD: 16,
	ALG_KOREAN_SEED_CBC_NOPAD: 17,
	MODE_DECRYPT: 1,
	MODE_ENCRYPT: 2,

	/**
	 * Cipher constructor.
	 * @abstract
	 * @param {[type]} cipher    [description]
	 * @param {[type]} algorithm [description]
	 */
	Cipher: function(cipher, algorithm){
		if (this.constructor === this.Cipher) {
      		throw new Error("Can't instantiate abstract class!");
    	}
		cipher.algorithm = algorithm;
		cipher.initialized = false;
	},

	/**
	 * Returns an instance of the relevant Cipher object
	 * @param  {Number} algorithm      [description]
	 * @param  {[type]} externalAccess [description]
	 */
	getInstance: function(algorithm, externalAccess){
		switch(algorithm){
			case this.ALG_DES_CBC_NOPAD:
			case this.ALG_DES_CBC_ISO9797_M1:
			case this.ALG_DES_CBC_ISO9797_M2:
			case this.ALG_DES_CBC_PKCS5:
			case this.ALG_DES_ECB_NOPAD:
			case this.ALG_DES_ECB_ISO9797_M1:
			case this.ALG_DES_ECB_ISO9797_M2:
			case this.ALG_DES_ECB_PKCS5:
			case this.ALG_RSA_ISO14888:
				//not implemented
				break;
			case this.ALG_RSA_PKCS1:
				//return new rsaCipher.RSACipher(algorithm);
				//not implemented
			case this.ALG_RSA_ISO9796:
				//deprecated
			case this.ALG_RSA_NOPAD:
			case this.ALG_AES_BLOCK_128_CBC_NOPAD:
			case this.ALG_AES_BLOCK_128_ECB_NOPAD:
				//not implemented
				break;
			case this.ALG_RSA_PKCS1_OAEP:
				var rsaCipher = require('./rsa-cipher.js');
				return new rsaCipher.RSACipher(algorithm);
			case this.ALG_KOREAN_SEED_ECB_NOPAD:
			case this.ALG_KOREAN_SEED_CBC_NOPAD:
				//not implemented
				break;
		}
	},
	/**
	 * Abstract methods, to be implemented by <algorithm>-cipher
	 */
	/**
	 * Sets the mode of the cipher
	 * @abstract
	 * @param  {Cipher} cipher [description]
	 * @param  {Key} 	theKey [description]
	 * @param  {Number} mode   [description]
	 * @param  {Array}  bArray [description]
	 * @param  {Number} bOff   [description]
	 * @param  {Number} bLen   [description]
	 */
	init: function(cipher, theKey, mode, bArray, bOff, bLen){
		throw new Error("Can't call abstract method");
	},
	/**
	 * @abstract
	 * @param  {Cipher} cipher [description]
	 * @return {Number}        [description]
	 */
	getAlgorithm: function(cipher){
		throw new Error("Can't call abstract method");
	},
	update: function(cipher, inBuff, inOffset, inLength, outBuff, outOffset){
		throw new Error("Can't call abstract method");
	},
	doFinal: function(){
		throw new Error("Can't call abstract method");
	}

};
/**
 * 
 */