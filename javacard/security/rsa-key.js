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