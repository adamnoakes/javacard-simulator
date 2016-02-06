/*!
 * Exceptions
 * @author Adam Noakes
 * University of Southamption
 */

function Exception(exception, type, reason){
    exception.type = type;
    exception.reason = reason;
    exception.sw = '0x6F00';
}
function CardException(reason){
    this.Exception(this, 'CardException', reason);
}
function CardRuntimeException(reason){
    this.Exception(this, 'CardRuntimeException', reason);
}
function PINException(reason){
    this.Exception(this, 'PINException', reason);
}
function SystemException(reason){
    this.Exception(this, 'SystemException', reason);
}
function ISOException(reason){
    this.Exception(this, 'ISOException', reason);
}
function APDUException(reason){
    this.Exception(this, 'APDUException', reason);
}
function TransactionException(reason){
    this.Exception(this, 'TransactionException', reason);
}
function UserException(reason){
    this.Exception(this, 'UserException', reason);
}
function setReason(Exception, reason){
    Exception.reason = reason;
}
function getCardException(CardException){
    return new Error('CardException: ' + CardException.reason);
}
function getCardRuntimeException(CardRuntimeException){
    return new Error('CardRuntimeException: ' + CardRuntimeException.reason);
}
function getPINException(PINException){
    var reasons = [];
    reasons[1] = 'ILLEGAL_VALUE';
    return new Error('PINException: ' + reasons[PINException.reason]);

}
function getSystemException(SystemException){
    var reasons = [];
    reasons[1] = 'ILLEGAL_VALUE';
    reasons[2] = 'NO_TRANSIENT_SPACE';
    reasons[3] = 'ILLEGAL_TRANSIENT';
    reasons[4] = 'ILLEGAL_AID';
    reasons[5] = 'NO_RESOURCE';
    reasons[6] = 'ILLEGAL_USE';
    return new Error('SystemException: ' + reasons[SystemException.reason]);
}
function getISOException(ISOException){
    var reasons = [];
    return new Error('0x' + ISOException.reason.toString(16));
}
function getAPDUException(APDUException){
    var reasons = [];
    reasons[1] = 'ILLEGAL_USE';
    reasons[2] = 'BUFFER_BOUNDS';
    reasons[3] = 'BAD_LENGTH';
    reasons[4] = 'IO_ERROR';
    reasons[170] = 'NO_T0_GETRESPONSE';
    reasons[171] = 'T1_IFD_ABORT';
    reasons[172] = 'NO_T0_REISSUE';
    return new Error('APDUException: ' + reasons[APDUException.reason]);
}
function getTransactionException(TransactionException){
    var reasons = [];
    reasons[1] = 'IN_PROGRESS';
    reasons[2] = 'NOT_IN_PROGRESS';
    return new Error('TransactionException: ' + reasons[TransactionException.reason]);
}
function getUserException(UserException){
    return new Error('UserException: ' + UserException.reason);
}

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
     * Handles javacard.framework Exception api calls.
     */
    run: function(clas, method, type, param, obj, objref, smartcard){
        switch(method){
             case 4:  //CardException
                 return (method === 0 ? new CardException(param[0]) : 
                    getCardException(obj));
            case 5:  //CardRuntimeException
                return (method === 0 ? new CardRuntimeException(param[0]) : 
                    getCardRuntimeException(obj));
            case 7:  //ISOException
               return (method === 0 ? new ISOException(param[0]) : 
                    getISOException(obj));
            case 11:  //PINException
                return (method === 0 ? new PINException(param[0]) : 
                    getPINException(obj));
            case 12:  //APDUException
                return (method === 0 ? new APDUException(param[0]) : 
                    getAPDUException(obj));
            case 13:  //SystemException
                return (method === 0 ? new SystemException(param[0]) : 
                    getSystemException(obj));
            case 14:  //TransactionException
                return (method === 0 ? new TransactionException(param[0]) : 
                    getTransactionException(obj));
            case 15:  //UserException
                return (method === 0 ? new UserException(param[0]) : 
                    getUserException(obj));
            default:
                return new Error('Method ' + method + ' not defined for Exception');
        }
    }
};

/**
 * ADAM'S CODE ENDS HERE
 */

//this code does not do what it should

/**
 * ROBIN WILLIAM'S CODE
 */