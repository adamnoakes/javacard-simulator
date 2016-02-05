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

	getExponent: getterDecorator(rsaKey.getExponent),
	getModulus: getterDecorator(rsaKey.getModulus),
	setExponent: setterDecorator(rsaKey.setExponent),
	setModulus: setterDecorator(rsaKey.setModulus),
	setKey: setterDecorator(rsaKey.setKey)
};