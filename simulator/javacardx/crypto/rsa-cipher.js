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
var Util = require('../../javacard/framework/Util.js');
var keys = require('../../javacard/security/keys.js');
var rsaPublicKey = require('../../javacard/security/rsa-public-key.js');
var rsaPrivateCrtKey = require('../../javacard/security/rsa-private-crt-key.js');

/**
 * Module exports.
 * @public
 */

module.exports = {
	/**
	 * Handles javacardx.crypto.cipher api calls for rsa algorithms.
	 *
	 * @param  {Number} method     The method token.
	 * @param  {Number} methodType The method type token.
	 * @param  {Array}  param      Popped from operand stack.
	 * @param  {Cipher} cipher     The cipher object.
	 * @return            				 Error or the result of called function.
	 */
	run: function(method, methodType, param, cipher){
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
				return this.init(cipher, param[0], param[1]);
			case 5:
				return new Error('Method update() not supported for RSACipher');
				//update
			default:
				return new Error('Method ' + method + ' not defined for RSACipher');
				//throw error, cannot perform method method, methodType methodType
		}
	},

	/**
	 * Cipher object constructor for rsa algorithms.
	 *
	 * @param  {Number} algorithm The desired algorithm code (see cipher.js)
	 */
	RSACipher: function(algorithm){
		//RSACipher extends Cipher
		cipher.Cipher(this, algorithm);
	},

	//should be bArray = [], bOff = 0, bLen = 0
	/**
	 * Initializes the Cipher object with the appropriate Key.
	 *
	 * @param  {Cipher} cipherObj The Cipher object
	 * @param  {RSAKey} rsaKey    The key (theKey).
	 * @param  {Number} mode      One of MODE_DECRYPT or MODE_ENCRYPT.
	 * @return {Error}						Can return if error occurs
	 */
	init: function(cipherObj, rsaKey, mode){
		//if theKey is not isinstance of RSAPrivateKey/ RSAPublicKey/ RSAPrivateCRTKey
        //raise CryptoException(CryptoException.ILLEGAL_VALUE)
        if(!keys.isInitialized(rsaKey)){
        	return new Error('CryptoException.UNINITIALIZED_KEY');
        } else if(mode !== cipher.MODE_ENCRYPT && mode !== cipher.MODE_DECRYPT){
        	return new Error('CryptoException.ILLEGAL_VALUE');
        }
		cipherObj.mode = mode;
		cipherObj.key = rsaKey;
		cipherObj.initialized = true;
	},
	/**
	 * Generates encrypted/decrypted output from all/last input data.
	 *
	 * @param  {Cipher} cipherObj The Cipher object.
	 * @param  {Array}  inBuff    Input buffer of data to be encrypted/decrypted.
	 * @param  {Number} inOffset  Offset into the input buffer at which to begin.
	 * @param  {Number} inLength  Byte length to be encrypted/decrypted.
	 * @param  {Array}  outBuff   Output buffer, may be the same as the input.
	 * @param  {Number} outOffset Offset into the output buffer where output data begins
	 * @return {Number | Error}   Number of bytes output in outBuff or an Error
	 */
	doFinal: function(cipherObj, inBuff, inOffset, inLength, outBuff, outOffset){
		if(!cipherObj.initialized){
			return new Error('CryptoException.INVALID_INT');
		}
		var data;
		var result;
		var nodeRSA;
		data = Array.apply(null, Array(inLength)).map(Number.prototype.valueOf,0);
		Util.arrayCopyNonAtomic(inBuff, inOffset, data, 0, inLength);
		if(data.length != Math.floor(cipherObj.key.size / 8)){
			console.log(data.length);
			return new Error('CryptoException.ILLEGAL_VALUE');
		}
		try {
			//Using private key
			if (cipherObj.key.private) {
				//Generates NodeRSA object from javacard key.
				nodeRSA = rsaPrivateCrtKey.getNodeRSA(cipherObj.key);
				if (cipherObj.mode === cipher.MODE_ENCRYPT) {
					//Perform encryption
					result = Array.prototype.slice.call(nodeRSA.encryptPrivate(new Buffer(data)), 0);
				} else if (cipherObj.mode === cipher.MODE_DECRYPT) {
					//Perform decryption
					result = Array.prototype.slice.call(nodeRSA.decrypt(new Buffer(data)), 0);
				}
			//Using public key
			} else {
				//Generates NodeRSA object from javacard key.
				nodeRSA = rsaPublicKey.getNodeRSA(cipherObj.key);
				if (cipherObj.mode === cipher.MODE_ENCRYPT) {
					//Perform encryption
					result = Array.prototype.slice.call(nodeRSA.encrypt(new Buffer(data)), 0);
				} else if (cipherObj.mode === cipher.MODE_DECRYPT) {
					//Perform decryption
					result = Array.prototype.slice.call(nodeRSA.decryptPublic(new Buffer(data)), 0);
				}
			}
			//Reset output buffer
			outBuff.length = outOffset + result.length;
			for (var i = 0; i < outOffset; i++) {
				outBuff[i] = 0;
			}

			//Copy data to output buffer
			Util.arrayCopyNonAtomic(result, 0, outBuff, outOffset, result.length);
			return result.length;
		} catch(err){
			//Likely because NodeRSA method failed
			return new Error('doFinal() failed for RSA.');
		}
	}
};
