/*!
 * Exceptions
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module depedencies
 * @private
 */

var ISO7816 = require('./ISO7816.js');

/**
 * Module exports.
 * @public
 */

/**
 * NOTE: possible problem with this code returning objects on method 0 instead
 * of void, will have to be checked later.
 */
module.exports = {
    /**
     * Handles javacard.framework.*Exception api calls.
     *
     * @param  {Number}    classToken The class token.
     * @param  {Number}    method     The method token.
     * @param  {Number}    type       The method type token.
     * @param  {Array}     param      Popped from operand stack.
     * @param  {Exception} obj        The APDU object.
     * @return                        Error or the result of called function.
     */
    run: function(classToken, method, type, param, obj){
        switch(classToken){
            case 4:  //CardException
                 return (method === 0 ? initCardException(obj, param[0]) :
                    this.getCardException(obj || param[0]));
            case 5:  //CardRuntimeException
                return (method === 0 ? initCardRuntimeException(obj, param[0]) :
                    this.getCardRuntimeException(obj || param[0]));
            case 7:  //ISOException
                return (method === 0 ? initISOException(obj, param[0]) :
                    this.getISOException(obj || param[0]));
            case 11:  //PINException
                return (method === 0 ? initPINException(obj, param[0]) :
                    this.getPINException(obj || param[0]));
            case 12:  //APDUException
                return (method === 0 ? initAPDUException(obj, param[0]) :
                    this.getAPDUException(obj || param[0]));
            case 13:  //SystemException
                return (method === 0 ? initSystemException(obj, param[0]) :
                    this.getSystemException(obj || param[0]));
            case 14:  //TransactionException
                return (method === 0 ? initTransactionException(obj, param[0]) :
                    this.getTransactionException(obj || param[0]));
            case 15:  //UserException
                return (method === 0 ? initUserException(obj, param[0]) :
                    this.getUserException(obj || param[0]));
            default:
                return new Error('classTokens token ' + classToken + ' not implemented in simulator.');
        }
    },
    getCardException: function(cardException){
        return new Error('CardException: ' + cardException.reason);
    },
    getCardRuntimeException: function(cardRuntimeException){
        var reason = (cardRuntimeException instanceof Object ?
            cardRuntimeException.reason : cardRuntimeException);
        return new Error('CardRuntimeException: ' + reason);
    },
    getPINException: function(pinException){
        var reason = (pinException instanceof Object ?
            pinException.reason : pinException);
        var reasons = [];
        reasons[1] = 'ILLEGAL_VALUE';
        return new Error('PINException: ' + reasons[reason]);

    },
    getSystemException: function(systemException){
        var reason = (systemException instanceof Object ?
            systemException.reason : systemException);
        var reasons = [];
        reasons[1] = 'ILLEGAL_VALUE';
        reasons[2] = 'NO_TRANSIENT_SPACE';
        reasons[3] = 'ILLEGAL_TRANSIENT';
        reasons[4] = 'ILLEGAL_AID';
        reasons[5] = 'NO_RESOURCE';
        reasons[6] = 'ILLEGAL_USE';
        return new Error('SystemException: ' + reasons[reason]);
    },
    getISOException: function(isoException){
        var reason = (isoException instanceof Object ?
            isoException.reason : isoException);
        return new Error(ISO7816.search(reason));
    },
    getAPDUException: function(apduException){
        var reason = (apduException instanceof Object ?
            apduException.reason : apduException);
        var reasons = [];
        reasons[1] = 'ILLEGAL_USE';
        reasons[2] = 'BUFFER_BOUNDS';
        reasons[3] = 'BAD_LENGTH';
        reasons[4] = 'IO_ERROR';
        reasons[170] = 'NO_T0_GETRESPONSE';
        reasons[171] = 'T1_IFD_ABORT';
        reasons[172] = 'NO_T0_REISSUE';
        return new Error('APDUException: ' + reasons[reason]);
    },
    getTransactionException: function(transactionException){
        var reason = (transactionException instanceof Object ?
            transactionException.reason : transactionException);
        var reasons = [];
        reasons[1] = 'IN_PROGRESS';
        reasons[2] = 'NOT_IN_PROGRESS';
        return new Error('TransactionException: ' + reasons[reason]);
    },
    getUserException: function(userException){
        var reason = (userException instanceof Object ?
            userException.reason : userException);
        return new Error('UserException: ' + reason);
    }
};

/**
 * Exception constructor
 * @abstract
 * @param {Exception} exception The Exception object.
 * @param {Number}    type      Exception type identfier.
 * @param {String}    reason    Why the exception is being created.
 */
function Exception(exception, type, reason){
    if (this.constructor === Exception) {
        return new Error("Can't instantiate abstract class!");
    }
    exception.type = type;
    exception.reason = reason;
    exception.sw = '0x6F00';
}
function initCardException(exception, reason){
    this.Exception(exception, 'CardException', reason);
}
function initCardRuntimeException(exception, reason){
    this.Exception(exception, 'CardRuntimeException', reason);
}
function initPINException(exception, reason){
    this.Exception(exception, 'PINException', reason);
}
function initSystemException(exception, reason){
    this.Exception(exception, 'SystemException', reason);
}
function initISOException(exception, reason){
    this.Exception(exception, 'ISOException', reason);
}
function initAPDUException(exception, reason){
    this.Exception(exception, 'APDUException', reason);
}
function initTransactionException(exception, reason){
    this.Exception(exception, 'TransactionException', reason);
}
function initUserException(exception, reason){
    this.Exception(exception, 'UserException', reason);
}
function setReason(exception, reason){
    exception.reason = reason;
}

function getReason(exception){
  return exception.reason;
}
