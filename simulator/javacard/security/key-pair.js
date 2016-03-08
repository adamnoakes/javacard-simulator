/*!
 * key-pair
 *
 * This class is a container for a key pair (a public key and a private key).
 * 
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */
var keyBuilder = require('./key-builder.js');
var keys = require('./keys.js');
var rsaPublicKey = require('./rsa-public-key.js');
var rsaPrivateCrtKey = require('./rsa-private-crt-key.js');
var NodeRSA = require('node-rsa');

/**
 * Module exports.
 * @public
 */
module.exports = {
	/**
	 * Constants
	 */
	ALG_RSA: 1,
    ALG_RSA_CRT: 2,
    ALG_DSA: 3,
    ALG_EC_F2M: 4,
    ALG_EC_FP: 5,

    /**
     * Handles javacard.security.KeyPair api calls.
     * 
     * @param  {KeyPair} keyPair    The KeyPair object
     * @param  {Number}  method     The method token
     * @param  {Number}  methodType The method type token
     * @param  {Array}   param      Popped from operand stack
     * @return  Error or the result of called function.
     */
    run: function(keyPair, method, methodType, param){
        switch(method){
            case 0:
                if(param.length === 2){
                    return this.init(keyPair, param[0], param[1]);
                }
                return new Error('KeyPair.equals() not implemented.');
            case 1:
                if(param.length === 2){
                    return this.initFromPair(keyPair, param[0], param[1]);
                }
                return this.genKeyPair(keyPair);
            case 2:
                return this.getPrivate(keyPair);
            case 3:
                return this.getPublic(keyPair);
            default:
                return new Error('Method ' + method + ' not defined for KeyPair');
                //throw error, cannot perform method method, methodType methodType
        }
    },

    /**
     * Called on new keyword and sets initial values.
     */
    KeyPair: function(){
    	//to be used by genKeyPair
    	this.algorithm = 0;
    	this.keyLength = 0;
    	//needs to catch an exception
    	//CryptoException.NO_SUCH_ALGORITHM
    	this.publicKey = null;
		this.privateKey = null;
    },
    
    /**
     * Constructs a KeyPair instance for the specified algorithm and keylength.
     * 
     * @param  {KeyPair} keyPair   The KeyPair object.
     * @param  {Number}  algorithm The type of algorithm whose key pair needs
     *                             to be generated.
     * @param  {Number}  keyLength The key size in bits.
     * @return {Error}
     */
    init: function(keyPair, algorithm, keyLength){
        //to be used by genKeyPair
        keyPair.algorithm = algorithm;
        keyPair.keyLength = keyLength;
        
        var result = keyBuilder.buildKey(algorithm, keyPair.keyLength);
        if(result instanceof Error){//CryptoException.NO_SUCH_ALGORITHM
            return result;
        }
        keyPair.publicKey = result;
        result = keyBuilder.buildKey(algorithm, keyPair.keyLength);
        if(result instanceof Error){//CryptoException.NO_SUCH_ALGORITHM
            return result;
        }
        keyPair.privateKey = result;
    },

    /**
     * Constructs a new KeyPair object containing the specified public key
     * and private key.
     * 
     * @param  {KeyPair}    keyPair    The KeyPair object.
     * @param  {PublicKey}  publicKey  The public key.
     * @param  {PrivateKey} privateKey The private key.
     */
    initFromPair: function(keyPair, publicKey, privateKey){
        if(publicKey.algorithm !== privateKey.algorithm ||
            publicKey.keyLength !== privateKey.keyLength){
            return new Error('CryptoException.ILLEGAL_VALUE');
        }
    	keyPair.publicKey = publicKey;
    	keyPair.privateKey = privateKey;
    },

    /**
     * (Re)Initializes the key objects encapsulated in this KeyPair
     * instance with new key values.
     * 
     * @param  {KeyPair} keyPair The KeyPair object.
     */
    genKeyPair: function(keyPair){
    	var tmpKey;
		switch(keyPair.algorithm){
            //should set crt variables and otherss
			case this.ALG_RSA:
                break;
            case this.ALG_RSA_CRT:
				tmpKey = new NodeRSA({b: keyPair.keyLength});
				rsaPublicKey.setKey(keyPair.publicKey, tmpKey);
				rsaPrivateCrtKey.setKey(keyPair.privateKey, tmpKey);
				return;
		}
        return new Error('CryptoException.NO_SUCH_ALGORITHM');
    }
};

/**
 * Private functions.
 * @private
 */

function getPrivate(keyPair){
    return keyPair.privateKey;
}

function getPublic(keyPair){
    return keyPair.publicKey;
}