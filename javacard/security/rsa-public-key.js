/*!
 * rsa-public-key
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var keys = require('./keys.js');
var NodeRSA = require('node-rsa');

//cannot be saved like this in DB, but be exported on saving and then imported on load
function createKey(RSAPublicKey){
	var modulus = keys.arrayToLong(RSAPublicKey.modulus);
	var exponent = keys.arrayToLong(RSAPublicKey.exponent);
	RSAPublicKey.key = new NodeRSA(modulus, exponent);
}

function getterDecorator(f){
	function get(){
		if(arguments[0].initialized !== 1){
			//throw CryptoException(CryptoException.UNINITIALIZED_KEY)
		} else {
			return f.apply(this, arguments);
		}
	}
	return get;
}

function setterDecorator(f){
	function set(){
		f.apply(this, arguments);
		if(arguments[0].modulus && arguments[0].exponent){
			if(!arguments[0])
				createKey(arguments[0]);
			keys.setInitialized(arguments[0]);
		}
	}
	return set;
}

/**
 * Module exports.
 */

module.exports = {
	run: function(RSAPublicKey, method, methodType, param, smartcard){
		switch(method){
			case 0:
				return keys.clearKey(RSAPublicKey);
			case 1:
				return keys.getSize(RSAPublicKey);
			case 2:
				return keys.getType(RSAPublicKey);
			case 3:
				return keys.isInitialized(RSAPublicKey);
			case 4:
				return this.getExponent(RSAPublicKey, param[0], param[1], smartcard);
			case 5:
				return this.getModulus(RSAPublicKey, param[0], param[1], smartcard);
			case 6:
				return this.setExponent(RSAPublicKey, param[0], param[1], param[2]);
			case 7:
				return this.setModulus(RSAPublicKey, param[0], param[1], param[2]);
			default:
				return new Error('Method ' + method + ' not defined for RSAPublicKey');
				//throw error, cannot perform method method, methodType methodType
		}
	},
	/**
	 * [RSAPublicKey description]
	 * @constructor
	 * @param {Number} size
	 */
	RSAPublicKey: function(size){
		//extends public key
		keys.PublicKey(this, 4, size);
		this.exponent = [];
		this.modulus = [];
		this.key = null;
	},
	getExponent: getterDecorator(rsaKey.getExponent),
	getModulus: getterDecorator(rsaKey.getModulus),
	setExponent: setterDecorator(rsaKey.setExponent),
	setModulus: setterDecorator(rsaKey.setModulus),
	setKey: setterDecorator(rsaKey.setKey)
};