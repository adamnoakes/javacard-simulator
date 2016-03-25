/*!
 * crypto-exception
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module depedencies
 * @private
 */

var e = require('../framework/Exceptions.js');

/**
 * Module exports.
 * @public
 */

module.exports = {
    /**
     * Handles javacard.security.CryptoException api calls.
     * @param  {Exception} obj        The CryptoException object.
     * @param  {Number}    method     The method token.
     * @param  {Number}    type       The method type token.
     * @param  {Array}     param      Popped from operand stack.
     * @return                        Error or the result of called function.
     */
    run: function(obj, method, type, param){
        switch(method){
            case 0:
                return init(obj, param[0]);
            case 1:
                if(type === 6){//throwIt
                    return this.getCryptoException(param[0]);
                }
                return getReason(obj);
            case 2:
                return setReason(obj, param[0]);
            default:
                return new Error('Unknown method: ' + method + ' for CryptoException.');
        }
    },
    getCryptoException: function(reason){
        var reasons = [];
        reasons[1] = 'ILLEGAL_VALUE';
        reasons[2] = 'UNINITIALIZED_KEY';
        reasons[3] = 'NO_SUCH_ALGORITHM';
        reasons[4] = 'INVALID_INIT';
        reasons[5] = 'ILLEGAL_USE';
        return new Error('CryptoException: ' + reasons[reason]);
    },
};

function init(exception, reason){
    e.Exception(exception, 'UserException', reason);
}
function setReason(exception, reason){
    exception.reason = reason;
}

function getReason(exception){
  return exception.reason;
}
