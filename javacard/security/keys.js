/*!
 * keys
 * @author Adam Noakes
 * University of Southamption
 */

//TODO: should import s1

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
function Key(key, type, size){
	if (this.constructor === this.PublicKey) {
  		return new Error("Can't instantiate abstract class!");
	}
	key.initialized = 0;
	key.size = size;
	key.type = type;
}


/**
 * Module exports.
 */

module.exports = {
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
		Key(publicKey, typ, size);
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
		Key(privateKey, typ, size);
		privateKey.private = true;
	},
	
    /* 
     * Used to transform long to Array
     * >>> longToArray(25)
     * [25]
     * >>> longToArray(4867)
     * [3, 19]
     */
	longToArray: function(long){
		var s = long.toString(16);
		if ((s.length % 2) !== 0){
		    s = '0' + s;
		}
		var out = [];
		for(var i= s.length; i>0; i = i - 2){
		    out.push(parseInt(s.substr(i-2, 2), 16));
		}
	},
	//http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
	toArrayBuffer: function(buffer) {
	    var ab = new ArrayBuffer(buffer.length);
	    var view = new Uint8Array(ab);
	    for (var i = 0; i < buffer.length; ++i) {
	        view[i] = buffer[i];
	    }
	    return view;
	},
	/*
     * make a long from an Array
     * >>> arrayTolong([25])
     * 25
     * >>> arrayTolong([3, 19])
     * 4867
     */
	arrayToLong: function(bytes){
		var l;
		for(var i = bytes.length-1; i > -1; i--){
			l = l << 8;
			l += bytes[i];
		}
		return l;
	},

	binaryToarray: function(bytes){
		//incomplete
	},

	arrayTobinary: function(array){
		//incomplete
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
		    	var rsaPrivateKey = require('./rsa-private-key.js');
		        return rsaPrivateKey.clearKey(key);
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