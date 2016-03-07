/*!
 * rsa-key
 * Contains functins that can be performed on an RSAKey (Public or Private)
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */
var keys = require('./keys.js');
var NodeRSA = require('node-rsa');
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

	getNodeRSA: function(RSAKey, algorithm){
		var es; //encryptionScheme
		switch (algorithm) {
			case 10://PKCS1
				es = 'pkcs1';
				break;
			case 15://pkcs1_oaep
				es = 'pkcs1_oaep';
				break;
		}
		return new NodeRSA(undefined, {encryptionScheme: es});
	}
};
