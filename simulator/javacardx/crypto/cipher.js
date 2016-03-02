/*!
 * cipher
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */


var keys = require('../../javacard/security/keys.js');

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
	 * Handles javacardx.crypto.cipher api calls
	 *
	 * @param  {Number} method     The method token.
	 * @param  {Number} methodType The method type token.
	 * @param  {Array}  param      Popped from operand stack.
	 * @param  {Cipher} cipher     The cipher object.
	 * @return            				 Error or the result of called function.
	 */
	run: function(method, methodType, param, cipher){
		var algorithm = (cipher !== null ? cipher.algorithm : param[0]);
		switch(algorithm){
			case this.ALG_DES_CBC_NOPAD:
				return unsupportedAlgorithm('ALG_DES_CBC_NOPAD');
			case this.ALG_DES_CBC_ISO9797_M1:
				return unsupportedAlgorithm('ALG_DES_CBC_ISO9797_M1');
			case this.ALG_DES_CBC_ISO9797_M2:
				return unsupportedAlgorithm('ALG_DES_CBC_ISO9797_M2');
			case this.ALG_DES_CBC_PKCS5:
				return unsupportedAlgorithm('ALG_DES_CBC_PKCS5');
			case this.ALG_DES_ECB_NOPAD:
				return unsupportedAlgorithm('ALG_DES_ECB_NOPAD');
			case this.ALG_DES_ECB_ISO9797_M1:
				return unsupportedAlgorithm('ALG_DES_ECB_ISO9797_M1');
			case this.ALG_DES_ECB_ISO9797_M2:
				return unsupportedAlgorithm('ALG_DES_ECB_ISO9797_M2');
			case this.ALG_DES_ECB_PKCS5:
				return unsupportedAlgorithm('ALG_DES_ECB_PKCS5');
			case this.ALG_RSA_ISO14888:
				return unsupportedAlgorithm('ALG_RSA_ISO14888');
			case this.ALG_RSA_PKCS1:
				return unsupportedAlgorithm('ALG_RSA_PKCS1');
			case this.ALG_RSA_ISO9796:
				return unsupportedAlgorithm('ALG_RSA_ISO9796');
			case this.ALG_RSA_NOPAD:
				return unsupportedAlgorithm('ALG_RSA_NOPAD');
			case this.ALG_AES_BLOCK_128_CBC_NOPAD:
				return unsupportedAlgorithm('ALG_AES_BLOCK_128_CBC_NOPAD');
			case this.ALG_RSA_PKCS1_OAEP:
				var rsaCipher = require('./rsa-cipher.js');
				return rsaCipher.run(method, methodType, param, cipher);
			case this.ALG_KOREAN_SEED_ECB_NOPAD:
				return unsupportedAlgorithm('ALG_KOREAN_SEED_ECB_NOPAD');
			case this.ALG_KOREAN_SEED_CBC_NOPAD:
				return unsupportedAlgorithm('ALG_KOREAN_SEED_CBC_NOPAD');
			default:
				return new Error('Unsupported algorithm');
				//throw error, cannot perform method method, methodType methodType
		}
	},

	/**
	 * Cipher constructor, called by a class that inherits Cipher.
	 * @abstract
	 *
	 * @param {Cipher} cipher    The Cipher object.
	 * @param {Number} algorithm Algorithm token number, defined in constants.
	 */
	Cipher: function(cipher, algorithm){
		if (this.constructor === this.Cipher) {
      		return new Error("Can't instantiate abstract class!");
    	}
		cipher.algorithm = algorithm;
		cipher.initialized = false;
	},

	/**
	 * Creates a Cipher object instance of the selected algorithm.
	 *
	 * @param  {Number} algorithm      The desired Cipher algorithm. Valid codes
	 *                                 listed in ALG_* constants above.
	 * @param  {boolean} externalAccess True indicates that the instance will be
	 *                                 shared among multiple applet instances and
	 *                                 that the Cipher instance will also be
	 *                                 accessed.
	 *                                 (not implemented).
	 */
	getInstance: function(algorithm, externalAccess){
		switch(algorithm){
			case this.ALG_DES_CBC_NOPAD:
				return unsupportedAlgorithm('ALG_DES_CBC_NOPAD');
			case this.ALG_DES_CBC_ISO9797_M1:
				return unsupportedAlgorithm('ALG_DES_CBC_ISO9797_M1');
			case this.ALG_DES_CBC_ISO9797_M2:
				return unsupportedAlgorithm('ALG_DES_CBC_ISO9797_M2');
			case this.ALG_DES_CBC_PKCS5:
				return unsupportedAlgorithm('ALG_DES_CBC_PKCS5');
			case this.ALG_DES_ECB_NOPAD:
				return unsupportedAlgorithm('ALG_DES_ECB_NOPAD');
			case this.ALG_DES_ECB_ISO9797_M1:
				return unsupportedAlgorithm('ALG_DES_ECB_ISO9797_M1');
			case this.ALG_DES_ECB_ISO9797_M2:
				return unsupportedAlgorithm('ALG_DES_ECB_ISO9797_M2');
			case this.ALG_DES_ECB_PKCS5:
				return unsupportedAlgorithm('ALG_DES_ECB_PKCS5');
			case this.ALG_RSA_ISO14888:
				return unsupportedAlgorithm('ALG_RSA_ISO14888');
			case this.ALG_RSA_PKCS1:
				return unsupportedAlgorithm('ALG_RSA_PKCS1');
			case this.ALG_RSA_ISO9796:
				return unsupportedAlgorithm('ALG_RSA_ISO9796');
			case this.ALG_RSA_NOPAD:
				return unsupportedAlgorithm('ALG_RSA_NOPAD');
			case this.ALG_AES_BLOCK_128_CBC_NOPAD:
				return unsupportedAlgorithm('ALG_AES_BLOCK_128_CBC_NOPAD');
			case this.ALG_RSA_PKCS1_OAEP:
				var rsaCipher = require('./rsa-cipher.js');
				return new rsaCipher.RSACipher(algorithm);
			case this.ALG_KOREAN_SEED_ECB_NOPAD:
				return unsupportedAlgorithm('ALG_KOREAN_SEED_ECB_NOPAD');
			case this.ALG_KOREAN_SEED_CBC_NOPAD:
				return unsupportedAlgorithm('ALG_KOREAN_SEED_CBC_NOPAD');
			default:
				return new Error(algorithm.toString());
			//throw error, cannot perform method method, methodType methodType
		}
	}
};

/**
 * Private functions
 */

/**
 * Returns error that an algorithm was referenced that is not supported
 * @param  {String} alg Name of the algorithm.
 * @return {Error}      The error.
 */
function unsupportedAlgorithm(alg){
	return new Error('Unsupported algorithm: ' + alg + ' for javacardx.crypto.cipher');
}
