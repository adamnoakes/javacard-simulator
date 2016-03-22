/*!
 * rsa-public-key
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */
var keys = require('./keys.js');
var rsaKey = require('./rsa-key.js');

/**
 * Creates a NodeRSA key that can be used to perform encryption and
 * decryption. This cannot be stored in a database and therefore must be
 * created each time it is required.
 * 
 * @param  {RSAPublicKey} RSAPublicKey The RSAPublicKey object.
 * @param  {Number}       algorithm    The algorithm token number.
 * @return {NodeRSA}
 */
function createKey(RSAPublicKey, algorithm){
	var nodeRSAKey = rsaKey.getNodeRSA(RSAPrivateCrtKey, algorithm);
	nodeRSAKey.importKey({
		e: new Buffer(RSAPublicKey.exponent),
		n: new Buffer(RSAPublicKey.modulus)
	});
	return nodeRSAKey;
}

function getExponent(RSAKey, buffer, offset){
	Util.arrayCopy(RSAKey.exponent, 0, buffer, offset,
		len(RSAKey.exponent));

	return len(RSAKey.exponent);
}
function getModulus(RSAKey, buffer, offset){
	Util.arrayCopy(RSAKey.modulus, 0, buffer, offset,
		len(RSAKey.modulus));

	return len(RSAKey.modulus);
}
function setExponent(RSAKey, buffer, offset, length){
	RSAKey.exponent = buffer.slice(offset, offset + length);
}
function setModulus(RSAKey, buffer, offset, length){
	if(length != Math.floor(keys.getSize(RSAKey) / 8)){
		return new Error('CryptoException.INVALID_INIT');
	} else {
		RSAKey.modulus = buffer.slice(offset,
			offset + length);
	}
}
function getterDecorator(f){
	function get(){
		if(arguments[0].initialized !== 1){
			return CryptoException(CryptoException.UNINITIALIZED_KEY);
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
		this.exponent = null;
		this.modulus = null;
		this.key = null;
	},
	getNodeRSA: function(RSAPublicKey, algorithm){
		if(RSAPublicKey.initialized === 1){
			return createKey(RSAPublicKey, algorithm);
		} else {
			return new Error('Key not initialized');
		}
	},
	getExponent: getterDecorator(getExponent),
	getModulus: getterDecorator(getModulus),
	setExponent: setterDecorator(setExponent),
	setModulus: setterDecorator(setModulus),
	setKey: setterDecorator(function(RSAKey, theKey){
		var components = theKey.exportKey('components-public');
		RSAKey.exponent = components.e.toJSON().data;
		RSAKey.modulus = components.n.toJSON().data;
	})
};
