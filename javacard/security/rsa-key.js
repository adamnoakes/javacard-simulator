/*!
 * rsa-key
 * Contains functins that can be performed on an RSAKey (Public or Private)
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var keys = require('./keys.js');
var Util = require('../framework/Util.js');

/**
 * Module exports.
 */
module.exports = {
	getExponent: function(RSAKey, buffer, offset, smartcard){
		Util.arrayCopy(RSAKey.exponent, 0, buffer, offset, 
			len(RSAKey.exponent));

		return len(RSAKey.exponent);
	},
	getModulus: function(RSAKey, buffer, offset, smartcard){
		Util.arrayCopy(RSAKey.modulus, 0, buffer, offset, 
			len(RSAKey.modulus));

		return len(RSAKey.modulus);
	},
	setExponent: function(RSAKey, buffer, offset, length){
		RSAKey.exponent = buffer.slice(offset, offset + length);
	},
	setModulus: function(RSAKey, buffer, offset, length){
		if(length != Math.floor(keys.getSize(RSAKey) / 8)){
			throw new Error('CryptoException.INVALID_INIT');
		} else {
			RSAKey.modulus = buffer.slice(offset,
				offset + length);
		}
	},
	clearKey: function(RSAKey){
		RSAKey.exponent = undefined;
		RSAKey.modulus = undefined;
		RSAKey.key = undefined;
	},
	/**
	 * [setKey description]
	 * @param {RSAPublicKey/RSAPrivateKey} RSAKey
	 * @param {NodeRSA} theKey [description]
	 */
	setKey: function(RSAKey, theKey){
		RSAKey.key = theKey;
		RSAKey.exponent = key.longToArray(theKey.e);
		RSAKey.modulus = key.longToArray(theKey.n);
	}
};