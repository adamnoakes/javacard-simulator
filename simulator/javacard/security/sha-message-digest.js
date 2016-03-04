/*!
 * SHAMessageDigest
 *
 * The SHAMessageDigest class is a sub class of MessageDigest.
 *
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module depedencies
 * @private
 */

var messageDigest = require('./message-digest.js');
var util = require('../framework/Util.js');
var crypt = require('crypt');

/**
 * Module exports.
 * @public
 */
var ALG_SHA = 1;
module.exports = {
  /**
   * Handles javacard.security.MessageDigest api calls for SHA algorithm.
   * @param  {Number}           method The method token.
   * @param  {Array}            param  Popped from operand stack.
   * @param  {SHAMessageDigest} obj    The SHAMessageDigest object.
   * @return                           Error or the result of called function.
   */
  run: function(obj, method, param){
    switch (method) {
      case 1://doFinal
        return doFinal(obj, param[0], param[1], param[2], param[3], param[4]);
      case 2://getAlgorithm
        return getAlgorithm(obj);
      case 3://getLength
        return getLength(obj);
      case 4://reset
        return reset(obj);
      case 5: //update
        return update(obj, param[0], param[1], param[2]);
    }

    return new Error('Method ' + method + ' not implemented for SHAMessageDigest');
  },

  SHAMessageDigest: function(externalAccess){
    this.algorithm = ALG_SHA
    console.log('algorithm: ' + this.algorithm);
    this.hashLength = 20;
    this.externalAccess = externalAccess;
    this.unprocessed = [];
  }
};

/**
 * Generates a hash of all/last input data. Completes and returns the hash
 * computation after performing final operations such as padding. The
 * MessageDigest object is reset to the initial state after this call is made.
 *
 * @param  {Array}  inBuff    The input buffer of data to be hashed
 * @param  {Number} inOffset  The offset into the input buffer at which to begin
 *                            hash generation
 * @param  {Number} inLength  The byte length to hash
 * @param  {Array}  outBuff   The output buffer, may be the same as the input
 *                            buffer
 * @param  {Number} outOffset The offset into the output buffer where the
 *                            resulting hash value begins
 * @return {Number}           Number of bytes of hash output in outBuff
 */
function doFinal(shaMessageDigest, inBuff, inOffset, inLength, outBuff, outOffset){
  update(shaMessageDigest, inBuff, inOffset, inLength);
  console.log(shaMessageDigest.unprocessed);
  var m  = crypt.bytesToWords(shaMessageDigest.unprocessed),
        l  = shaMessageDigest.unprocessed.length * 8,
        w  = [],
        H0 =  1732584193,
        H1 = -271733879,
        H2 = -1732584194,
        H3 =  271733878,
        H4 = -1009589776;

    // Padding
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >>> 9) << 4) + 15] = l;

    for (var i = 0; i < m.length; i += 16) {
      var a = H0,
          b = H1,
          c = H2,
          d = H3,
          e = H4;

      for (var j = 0; j < 80; j++) {

        if (j < 16)
          w[j] = m[i + j];
        else {
          var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
          w[j] = (n << 1) | (n >>> 31);
        }

        var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                         (H1 ^ H2 ^ H3) - 899497514);

        H4 = H3;
        H3 = H2;
        H2 = (H1 << 30) | (H1 >>> 2);
        H1 = H0;
        H0 = t;
      }

      H0 += a;
      H1 += b;
      H2 += c;
      H3 += d;
      H4 += e;
    }
    var result = crypt.wordsToBytes([H0,H1,H2,H3,H4]);
    util.arrayCopyNonAtomic(result, 0, outBuff, outOffset, shaMessageDigest.hashLength);
    reset(shaMessageDigest);
    return result.length;
}

/**
 * Gets the Message digest algorithm.
 *
 * @param  {SHAMessageDigest} shaMessageDigest The SHAMessageDigest object.
 * @return {Number}                            The algorithm code.
 */
function getAlgorithm(shaMessageDigest){
  return shaMessageDigest.algorithm;
}

/**
 * Return the byte length of the hash
 *
 * @param  {SHAMessageDigest} shaMessageDigest The SHAMessageDigest object.
 * @return {Number}                            hash length
 */
function getLength(shaMessageDigest){
  return shaMessageDigest.hashLength;
}

/**
 * Resets the MessageDigest object to the initial state for further use.
 *
 * @param {SHAMessageDigest} shaMessageDigest The SHAMessageDigest object.
 */
function reset(shaMessageDigest){
  shaMessageDigest.unprocessed = [];
}

/**
 * Accumulates a hash of the input data. This method requires temporary storage
 * of intermediate results. In addition, if the input data length is not block
 * aligned (multiple of block size) then additional internal storage may be
 * allocated at this time to store a partial input data block.
 *
 * @param {SHAMessageDigest} shaMessageDigest The SHAMessageDigest object.
 * @param  {Array}  inBuff    The input buffer of data to be hashed
 * @param  {Number} inOffset  The offset into the input buffer at which to begin
 *                            hash generation
 * @param  {Number} inLength  The byte length to hash
 */
function update(shaMessageDigest, inBuff, inOffset, inLength){
  Array.prototype.push.apply(
    shaMessageDigest.unprocessed,
    inBuff.slice(inOffset, inOffset + inLength)
  );
}
