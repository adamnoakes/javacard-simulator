/*!
 * key-builder
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var RSAPublicKey = require('./rsa-public-key.js').RSAPublicKey;
var RSAPrivateKey = require('./rsa-private-key.js').RSAPrivateKey;
var RSAPrivateCrtKey = require('./rsa-private-crt-key.js').RSAPrivateCrtKey;

/**
 * Module exports.
 * @public
 */

module.exports = {

	/**
	 * Constants.
	 */

	TYPE_DES_TRANSIENT_RESET: 1,
	TYPE_DES_TRANSIENT_DESELECT: 2,
	TYPE_DES: 3,
	TYPE_RSA_PUBLIC: 4,
	TYPE_RSA_PRIVATE: 5,
	TYPE_RSA_CRT_PRIVATE: 6,
	TYPE_DSA_PUBLIC: 7,
	TYPE_DSA_PRIVATE: 8,
	TYPE_EC_F2M_PUBLIC: 9,
	TYPE_EC_F2M_PRIVATE: 10,
	TYPE_EC_FP_PUBLIC: 11,
	TYPE_EC_FP_PRIVATE: 12,
	TYPE_AES_TRANSIENT_RESET: 13,
	TYPE_AES_TRANSIENT_DESELECT: 14,
	TYPE_AES: 15,
	TYPE_KOREAN_SEED_TRANSIENT_RESET: 16,
	TYPE_KOREAN_SEED_TRANSIENT_DESELECT: 17,
	TYPE_KOREAN_SEED: 18,
	TYPE_HMAC_TRANSIENT_RESET: 19,
	TYPE_HMAC_TRANSIENT_DESELECT: 20,
	TYPE_HMAC: 21,
	LENGTH_DES: 64,
	LENGTH_DES3_2KEY: 128,
	LENGTH_DES3_3KEY: 192,
	LENGTH_RSA_512: 512,
	LENGTH_RSA_736: 736,
	LENGTH_RSA_768: 768,
	LENGTH_RSA_896: 896,
	LENGTH_RSA_1024: 1024,
	LENGTH_RSA_1280: 1280,
	LENGTH_RSA_1536: 1536,
	LENGTH_RSA_1984: 1984,
	LENGTH_RSA_2048: 2048,
	LENGTH_DSA_512: 512,
	LENGTH_DSA_768: 768,
	LENGTH_DSA_1024: 1024,
	LENGTH_EC_FP_112: 112,
	LENGTH_EC_F2M_113: 113,
	LENGTH_EC_FP_128: 128,
	LENGTH_EC_F2M_131: 131,
	LENGTH_EC_FP_160: 160,
	LENGTH_EC_F2M_163: 163,
	LENGTH_EC_FP_192: 192,
	LENGTH_EC_F2M_193: 193,
	LENGTH_AES_128: 128,
	LENGTH_AES_192: 192,
	LENGTH_AES_256: 256,
	LENGTH_KOREAN_SEED_128: 128,
	LENGTH_HMAC_SHA_1_BLOCK_64: 64,
	LENGTH_HMAC_SHA_256_BLOCK_64: 64,
	LENGTH_HMAC_SHA_384_BLOCK_128: 128,
	LENGTH_HMAC_SHA_512_BLOCK_128: 128,

	run: function(keyBuilder, method, methodType, param){
		switch(method){
			case 0:
				if(param.length === 1){//public equals()
					return new Error('KeyBuilder.equals() not implemented.');
                }
				return this.buildKey(param[0], param[1], param[2]);
			default:
				return new Error('Method ' + method + ' not defined for RSAPrivateKey');
				//throw error, cannot perform method method, methodType methodType
		}
	},

	/**
	 * @param  {Number} keyType
	 * @param  {Number} keyLength
	 * @param  {Boolean} keyEncryption
	 * @return {Key}
	 */
	buildKey: function(keyType, keyLength, keyEncryption){
		//not implemented functions show throw exceptions
		//CryptoException.NO_SUCH_ALGORITHM
		switch (keyType) {
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
		    	return new RSAPublicKey(keyLength);
		    case this.TYPE_RSA_PRIVATE:
		        return new RSAPrivateKey(keyLength);
		    case this.TYPE_RSA_CRT_PRIVATE:
		        return new RSAPrivateCrtKey(keyLength);
		    default:
		        return new Error('CryptoException.NO_SUCH_ALGORITHM');
		}
	}
};