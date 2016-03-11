/*!
 * OwnerPIN
 *
 * This class represents an Owner PIN, implements Personal Identification Number
 * functionality as defined in the PIN interface, and provides the ability to
 * update the PIN and thus owner functionality.

 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */
var JCSystem = require('./JCSystem.js');
var e = require('./Exceptions.js');
var le = require('../../java/lang/exceptions.js');

/**
 * Module exports.
 * @public
 */

module.exports ={
  /**
   * Handles javacard.framework.OwnerPIN api calls.
   * @param  {Number}   method The method token.
   * @param  {Number}   type   The method type token.
   * @param  {Array}    param  Popped from operand stack.
   * @param  {OwnerPIN} obj    The OwnerPIN object.
   * @return                   Error or the result of called function.
   */
  run: function(method, type, param, obj, smartcard){
    switch(method){
      case 0://init
        return init(obj, param[0], param[1]);
      case 1://check
        return check(obj, param[0], param[1], param[2]);
      case 2://getTriesRemaining
        return getTriesRemaining(obj);
      case 3://getValidatedFlag (protected)
        return getValidatedFlag(obj);
      case 4://isValidated
        return isValidated(obj);
      case 5://reset
        return reset(obj);
      case 6://resetAndUnblock
        return resetAndUnblock(obj);
      case 7://setValidatedFlag
        return setValidatedFlag(obj, param[0]);
      case 8://update
        return update(obj, param[0], param[1], param[2], smartcard);
      default:
        return new Error('Method ' + method + ' not defined for OwnerPIN');
    }
  },

  /**
   * Called on new keyword and sets initial values.
   */
  OwnerPIN: function(){
    this.pin = [];
    this.tryLimit = 0;
    this.triesRemaining = 0;
    this.maxPINSize = 0;
    this.validatedFlag = false;
    this.blocked = false;
  }
};

/**
 * OwnerPIN contructor, sets values.
 *
 * @param  {OwnerPIN} ownerPIN   The OwnerPIN object.
 * @param  {Number}   tryLimit   The maximum number of times an incorrect PIN
 *                               can be presented. tryLimit must be >=1
 * @param  {Number}   maxPINSize The maximum allowed PIN size.
 *                               maxPINSize must be >=1
 */
function init(ownerPIN, tryLimit, maxPINSize){
  ownerPIN.tryLimit = tryLimit;
  ownerPIN.maxPINSize = maxPINSize;
}

/**
 * Compares pin against the PIN value. If they match and the PIN is not blocked,
 * it sets the validated flag and resets the try counter to its maximum.
 *
 * @param  {OwnerPIN} ownerPIN The OwnerPIN object.
 * @param  {Array}    pinArray      The byte array containing the PIN being checked.
 * @param  {Number}   offset   The starting offset in the pin array.
 * @param  {Number}   length   The length of pin.
 * @return {boolean}           true if the PIN value matches; false otherwise.
 */
function check(ownerPIN, pinArray, offset, length){
  if(pinArray.length < offset + length || offset < 0 || length < 0){
    logAttempt(ownerPIN);
    return le.getArrayIndexOutOfBounds();
  }
  if(!pinArray || pinArray.constructor !== Array){
    logAttempt(ownerPIN);
    return le.getNullPointer();
  }
  if(ownerPIN.blocked){
    return false;
  }
  if(ownerPIN.pin.length !== length){
    logAttempt(ownerPIN);
    return false;
  }
  for(var i = 0; i < length; i++){
    if(pinArray[i + offset] !== ownerPIN.pin[i]){
      logAttempt(ownerPIN);
      return false;
    }
  }
  ownerPIN.validatedFlag = true;
  ownerPIN.triesRemaining = ownerPIN.tryLimit;
  return true;
}

/**
 * Returns the number of times remaining that an incorrect PIN
 * can be presented before the PIN is blocked.
 *
 * @param  {OwnerPIN} ownerPIN The OwnerPIN object.
 * @return {Number}            The number of times remaining.
 */
function getTriesRemaining(ownerPIN){
  return ownerPIN.triesRemaining;
}

/**
 * Returns validated flag and sets result in internal state.
 * @protected
 *
 * @param  {OwnerPIN} ownerPIN The OwnerPIN object.
 * @return {boolean}           validated flag.
 */
function getValidatedFlag(ownerPIN){
  return validatedFlag;
}

/**
 * Returns true if a valid PIN has been presented since the
 * last card reset or last call to reset().
 *
 * @param  {OwnerPIN} ownerPIN The OwnerPIN object.
 * @return {Boolean}          [description]
 */
function isValidated(ownerPIN){
  return getValidatedFlag(ownerPIN);
}

/**
 * If the validated flag is set, this method resets the validated flag and
 * resets the PIN try counter to the value of the PIN try limit.
 *
 * @param {OwnerPIN} ownerPIN The OwnerPIN object.
 */
function reset(ownerPIN){
  if(ownerPIN.validatedFlag){
    ownerPIN.triesRemaining = ownerPIN.tryLimit;
    ownerPIN.validatedFlag = false;
  }
}

/**
 * This method sets a new value for the PIN and resets the PIN try counter to
 * the value of the PIN try limit. It also resets the validated flag.
 *
 * @param  {OwnerPIN} ownerPIN The OwnerPIN object.
 * @param  {Array}    pin      The byte array containing the PIN being checked.
 * @param  {Number}   offset   The starting offset in the pin array.
 * @param  {Number}   length   The length of pin.
 */
function update(ownerPIN, pin, offset, length, smartcard){
  var err;
  if(length > ownerPIN.maxPINSize){
    return e.getPINException(1);
  }

  //should use transactions
  err = JCSystem.beginTransaction(smartcard);
  if(err instanceof Error) return err;
  try{
    ownerPIN.triesRemaining = ownerPIN.tryLimit;
    ownerPIN.validatedFlag = false;
    ownerPIN.pin = pin.slice(offset, offset + length);
  } catch (error){
    err = JCSystem.abortTransaction(smartcard);
    if(err instanceof Error){
      return err;
    }
    return;
  }
  JCSystem.commitTransaction(smartcard);
}

/**
 * This method resets the validated flag and resets the PIN try counter to the
 * value of the PIN try limit and clears the blocking state of the PIN.
 * @param {OwnerPIN} ownerPIN The OwnerPIN object.
 */
function resetAndUnblock(ownerPIN){
  ownerPIN.triesRemaining = ownerPIN.tryLimit;
  ownerPIN.validatedFlag = false;
}

/**
 * Helper functions
 */
function logAttempt(ownerPIN){
  ownerPIN.triesRemaining = ownerPIN.triesRemaining - 1;
  if(ownerPIN.triesRemaining === 0){
    ownerPIN.blocked = true;
  }
}
