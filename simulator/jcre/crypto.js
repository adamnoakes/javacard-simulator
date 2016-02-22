/*!
 * crypto
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var cipher = require('../javacardx/crypto/cipher.js');
var rsaCipher = require('../javacardx/crypto/rsa-cipher.js');

/**
 * Module exports.
 * @public
 */

module.exports = {

	/**
	 * Handles javacardx.crypto api calls.
	 *
	 * @param  {Number} classToken The class token.
	 * @param  {Number} method     The method token.
	 * @param  {Number} type       The method type token.
	 * @param  {Array}  param      Params popped from operand stack.
	 * @param  {Object} obj        The javacardx.crypto object.
	 * @return   			             Error or the result of called function.
	 */
	run: function(classToken, method, type, param, obj){
		switch(classToken){
      case 0://javacardx/crypto/KeyEncryption
        return new Error('Unsupported class: KeyEncryption');
			case 1://javacard/crypto/Cipher
        return cipher.run(method, type, param, obj);
			default:
				return new Error('Unsupported class for javacardx.crypto');
		}
	},

  newObject: function(classToken){
      switch (classToken) {
        case 16:
          return new keyPair.KeyPair();
    		default:
          return new Error('Unsupported Object');
      }
  }
};
