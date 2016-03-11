/*!
 * MessageDigest
 *
 * The MessageDigest class is the base class for hashing algorithms.
 * Implementations of MessageDigest algorithms must extend this class and
 * implement all the abstract methods.
 *
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies
 * @private
 */

var shaMessageDigest = require('./sha-message-digest.js');
/**
 * Module exports.
 * @public
 */
module.exports = {
  ALG_SHA: 1,
  /**
   * Handles javacard.security.MessageDigest api calls.
   * @param  {Number}        method The method token.
   * @param  {Number}        type   The method type token.
   * @param  {Array}         param  Popped from operand stack.
   * @param  {MessageDigest} obj    The MessageDigest object.
   * @return                        Error or the result of called function.
   */
  run: function(obj, method, type, param){
    switch (type) {
      case 3://CONSTANT_VirtualMethodref
        return this.runVirtual(obj, method, param);
      case 6://CONSTANT_StaticMethodref
        return this.runStatic(obj, method, param);
    }
    return new Error('Access flags used for MessageDigest not supported.');
  },

  /**
   * Handles javacard.security.MessageDigest static method calls.
   * @param  {Number}        method The method token.
   * @param  {Number}        type   The method type token.
   * @param  {Array}         param  Popped from operand stack.
   * @param  {MessageDigest} obj    The MessageDigest object.
   * @return                        Error or the result of called function.
   */
  runStatic: function(obj, method, param){
    switch (method) {
      case 0://getInstance
        return this.getInstance(param[0], param[1]);
      case 1://getInitializedMessageDigestInstance
        return getInitializedMessageDigestInstance(param[0], parm[1]);
    }
    return new Error('Static method ' + method + ' not supported for MessageDigest.');
  },

  /**
   * Handles javacard.security.MessageDigest virtual method calls.
   * @param  {Number}        method The method token.
   * @param  {Number}        type   The method type token.
   * @param  {Array}         param  Popped from operand stack.
   * @param  {MessageDigest} obj    The MessageDigest object.
   * @return                        Error or the result of called function.
   */
  runVirtual: function(obj, method, type, param){
    switch (obj.algorithm) {
      case this.ALG_SHA:
        return shaMessageDigest.run(obj, method, type, param);
    }
    return new Error('CryptoException.NO_SUCH_ALGORITHM: ' + obj.algorithm);
  },
  
  /**
   * Creates a MessageDigest object instance of the selected algorithm.
   */
  MessageDigest: function(){
    this.algorithm = 0;
    this.externalAccess = false;
  },

  /**
   * Creates a MessageDigest object instance of the selected algorithm.
   *
   * @param  {Number} algorithm       the desired message digest algorithm.
   *                                  Valid codes listed in ALG_* constants above,
   *                                  for example,ALG_SHA
   * @param  {Boolean} externalAccess Support not implemented.
   * @return {MessageDigest}          the MessageDigest object instance of the
   *                                  requested algorithm.
   */
  getInstance: function(algorithm, externalAccess){
    switch (algorithm) {
      case this.ALG_SHA:
        return new shaMessageDigest.SHAMessageDigest();
    }
    return new Error('CryptoException.NO_SUCH_ALGORITHM: ' + algorithm + this.ALG_SHA);
  }
};



/**
 * !NOT IMPLMENTED
 * Creates a InitializedMessageDigest object instance of the selected algorithm.
 *
 * @param  {Number} algorithm       the desired message digest algorithm.
 *                                  Valid codes listed in ALG_* constants above,
 *                                  for example,ALG_SHA
 * @param  {Boolean} externalAccess Support not implemented.
 */
function getInitializedMessageDigestInstance(algorithm, externalAccess){
  return new Error('InitializedMessageDigest not implemented.');
}
