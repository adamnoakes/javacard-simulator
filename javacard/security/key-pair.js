/*!
 * key-pair
 * @author Adam Noakes
 * University of Southamption
 */

var keyBuilder = require('./key-builder.js');
var keys = require('./keys.js');
var rsaPublicKey = require('./rsa-public-key.js');
var NodeRSA = require('node-rsa');


module.exports = {
	/**
	 * Constants
	 * @type {Number}
	 */
	ALG_RSA: 1,
    ALG_RSA_CRT: 2,
    ALG_DSA: 3,
    ALG_EC_F2M: 4,
    ALG_EC_FP: 5,

    /**
     * [KeyPair description]
     * @param {Number} param1 - Number represents algorithm type
     * @param {Number} param2 - Number represents 
     */
    
    KeyPair: function(algorithm, keyLength){
    	//to be used by genKeyPair
    	this.algorithm = algorithm;
    	this.keyLength = keyLength;
    	//needs to catch an exception
    	//CryptoException.NO_SUCH_ALGORITHM
    	this.publicKey = keyBuilder.buildKey(algorithm, this.keyLength);
		this.privateKey = keyBuilder.buildKey(algorithm, this.keyLength);

    },

    /**
     * [KeyPairFromPair description]
     * @param {PublicKey} publicKey
     * @param {PrivateKey} privateKey
     */
    KeyPairFromPair: function(publicKey, privateKey){
    	//Should possibly validate publicKey and privateKey and throw exception
    	//for invalid values. CryptoException.ILLEGAL_VALUE
    	this.publicKey = publicKey;
    	this.privateKey = privateKey;
    },

    genKeyPair: function(keyPair){
    	var tmpKey;
    	if(keyPair.publicKey.initialized || keyPair.privateKey.initialized){
    		//throw CryptoException(CryptoException.ILLEGAL_VALUE)
    	} else {
    		switch(keyPair.algorithm){
    			case this.ALG_RSA:
    				tmpKey = new NodeRSA({b: keyPair.keyLength});
    				rsaPublicKey.setKey(keyPair.publicKey, tmpKey);
    				rsaPublicKey.setKey(keyPair.privateKey, tmpKey);
    				break;
    		}
    	}
    }
}