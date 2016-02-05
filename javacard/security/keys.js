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
 * [Key description]
 * @constructor
 * @abstract
 * @param {[type]} key  [description]
 * @param {[type]} type  [description]
 * @param {[type]} size [description]
 */
function Key(key, type, size){
	if (this.constructor === PublicKey) {
  		throw new Error("Can't instantiate abstract class!");
	}
	key.initialized = 0;
	key.size = size;
	key.type = type;
}


/**
 * Module exports.
 */

modules.exports = {
	PublicKey: function(publicKey, typ, size){
		if (this.constructor === PublicKey) {
      		throw new Error("Can't instantiate abstract class!");
    	}
		//public key extends key
		key.key(publicKey, typ, size);
	},
	PrivateKey: function(privateKey, typ, size){
		if (this.constructor === PrivateKey) {
      		throw new Error("Can't instantiate abstract class!");
    	}
		//public key extends key
		key.key(privateKey, typ, size);
		key.private = true;
	},
	run: function(key, method, methodType, param){
		switch(method){
			case 0://void
				return {typ: 0, val: this.clearKey(key)};
			case 1://short
				return {typ: 1, val: this.getSize(key)};
			case 2://
				return {typ: 1, val: this.getType(key)};
			case 3:
				return {typ: 1, val: this.isInitialized(key)};
			case default:
				//throw error, cannot perform method method, methodType methodType

		}
	}
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
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	clearKey: function(key){
		switch (key.type) {
		    case this.TYPE_DES_TRANSIENT_RESET:
		        //not implemented
		        break;
		    case this.TYPE_DES_TRANSIENT_DESELECT:
		    	//not implemented
		        break;
		    case this.TYPE_DES:
		        //not implmeneted
		        break;
		    case this.TYPE_RSA_PUBLIC:
		    	return rsaPublicKey.clearKey(key);
		    case this.TYPE_RSA_PRIVATE:
		        return rsaPrivateKey.clearKey(key);
		    case this.TYPE_RSA_CRT_PRIVATE:
		        //not impleneted
		        break;
		}
	},

	getType: function(key){
		return key.type;
	},

	getSize: function(key){
		return key.size;
	}
};