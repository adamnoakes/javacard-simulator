/*!
 * keys
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Private functions.
 */

/**
 * @constructor
 * @abstract
 * @param {Key} key
 * @param {Number} type
 * @param {Number} size
 */
function Key(type, size){
	if (this.constructor === this.Key) {
  		return new Error("Can't instantiate abstract class!");
	}
	this.initialized = 0;
	this.size = size;
	this.type = type;
}

/**
 * Module exports.
 */
module.exports = {
	/**
     * Handles javacard.security.Key api calls.
     * 
     * @param  {Key} 	 key    	The Key object
     * @param  {Number}  method     The method token
     * @param  {Number}  methodType The method type token
     * @param  {Array}   param      Popped from operand stack
     * @return  Error or the result of called function.
     */
	run: function(key, method, methodType, param){
		switch(method){
			case 0://void
				return this.clearKey(key);
			case 1://short
				return this.getSize(key);
			case 2://
				return this.getType(key);
			case 3:
				return this.isInitialized(key);
			default:
				return new Error('Method ' + method + ' not defined for Key');
				//throw error, cannot perform method method, methodType methodType
		}
	},
	/**
	 * @constructor
	 * @abstract
	 * @param {PublicKey} publicKey
	 * @param {Number} typ
	 * @param {Number} size
	 */
	PublicKey: function(publicKey, typ, size){
		if (this.constructor === this.PublicKey) {
      		return new Error("Can't instantiate abstract class: PublicKey");
    	}
		//public key extends key
		Key.call(publicKey, typ, size);
	},
	/**
	 * @constructor
	 * @abstract
	 * @param {PrivateKey} privateKey
	 * @param {Number} typ
	 * @param {Number} size
	 */
	PrivateKey: function(privateKey, typ, size){
		if (this.constructor === this.PrivateKey) {
      		return new Error("Can't instantiate abstract class: PrivateKey");
    	}
		//public key extends key
		Key.call(privateKey, typ, size);
		privateKey.private = true;
	},

	isInitialized: function(key){
		return key.initialized;
	},

	setInitialized: function(key){
		key.initialized = 1;
	},

	/**
	 * Calls the clearKey method for the relevant key.type
	 * @param  {Key} key
	 * @return {Key | Error}
	 */
	clearKey: function(key){
		switch (key.type) {
		    case this.TYPE_DES_TRANSIENT_RESET:
		        return new Error('TYPE_DES_TRANSIENT_RESET not implmeneted');
		    case this.TYPE_DES_TRANSIENT_DESELECT:
		    	return new Error('TYPE_DES_TRANSIENT_DESELECT not implmeneted');
		    case this.TYPE_DES:
		        return new Error('TYPE_DES not implmeneted');
		    case this.TYPE_RSA_PUBLIC:
		    	var rsaPublicKey = require('./rsa-public-key.js');
		    	return rsaPublicKey.clearKey(key);
		    case this.TYPE_RSA_PRIVATE:
		    	return new Error('TYPE_RSA_PRIVATE not implmeneted');
		    case this.TYPE_RSA_CRT_PRIVATE:
		    	var rsaPrivateCrtKey = require('./rsa-private-crt-key.js');
		        return rsaPrivateCrtKey.clearKey(key);
		}
	},

	getType: function(key){
		return key.type;
	},

	getSize: function(key){
		return key.size;
	}
};
