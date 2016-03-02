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
  run: function(obj, method, accessFlags, param){
    switch (accessFlags) {
      case 0x04:
        return runProtected(obj, method, param);
      case 0x19://public static final
        return runPublicStaticFinal(obj, method, param);
      case 0x41://public abstract
        return runPublicAbstract(obj, method, param);
    }
  },

  runProtected: function(obj, method, param){
    switch (method){
      case 1:
        return init(obj, param[0], param[1]);
    }
    return new Error('Protected method ' + method + ' not supported for MessageDigest.');
  },

  runPublicSaticFinal: function(obj, method, param){
    switch (method) {
      case 0://getInstance
        return getInstance(param[0], param[1]);
      case 1://getInitializedMessageDigestInstance
        return getInitializedMessageDigestInstance(param[0], parm[1]);
    }
  },

  runSubClassMethod: function(obj, method, accessFlags, param){
    switch (obj.algorithm) {
      case this.ALG_SHA:
        return shaMessageDigest.run(obj, method, accessFlags, param);
    }
    return new Error('CryptoException.NO_SUCH_ALGORITHM');
  },
  /**
   * Creates a MessageDigest object instance of the selected algorithm.
   */
  MessageDigest: function(){
    this.algorithm = 0;
    this.externalAccess = false;
  }
};

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
function getInstance(algorithm, externalAccess){
  switch (algorithm) {
    case this.ALG_SHA:
      return new shaMessageDigest.SHAMessageDigest();
  }
  return new Error('CryptoException.NO_SUCH_ALGORITHM');
}

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
