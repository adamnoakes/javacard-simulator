/*!
 * rsa-private-key
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var keys = require('./keys.js');
var rsaKey = require('./rsa-key.js');

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
			keys.setInitialized(arguments[0]);
		}
	}
	return set;
}

/**
 * Module exports.
 */

module.exports = {
	run: function(RSAPrivateKey, method, methodType, param, smartcard){
		switch(method){
			case 0:
				return keys.clearKey(RSAPrivateKey);
			case 1:
				return keys.getSize(RSAPrivateKey);
			case 2:
				return keys.getType(RSAPrivateKey);
			case 3:
				return keys.isInitialized(RSAPrivateKey);
			case 4:
				return this.getExponent(RSAPrivateKey, param[0], param[1], smartcard);
			case 5:
				return this.getModulus(RSAPrivateKey, param[0], param[1], smartcard);
			case 6:
				return this.setExponent(RSAPrivateKey, param[0], param[1]);
			default:
				return new Error('Method ' + method + ' not defined for RSAPrivateKey');
				//throw error, cannot perform method method, methodType methodType
		}
	},

	/**
	 * [RSAPrivateKey description]
	 * @constructor
	 * @param {Number} size
	 */
	
	RSAPrivateKey: function(size){
		//extends private key
		keys.PrivateKey(this, 5, size);
		this.exponent = [];
		this.modulus = [];
		this.key = null;
	},

	/**
	 * @param {RSAKey} 	RSAKey
	 * @param {Array} 	buffer
	 * @param {Number} 	offset
	 * @type {[type]}
	 */
	getExponent: getterDecorator(rsaKey.getExponent),
	getModulus: getterDecorator(rsaKey.getModulus),
	setExponent: setterDecorator(rsaKey.setExponent),
	setModulus: setterDecorator(rsaKey.setModulus),
	setKey: setterDecorator(rsaKey.setKey)
};