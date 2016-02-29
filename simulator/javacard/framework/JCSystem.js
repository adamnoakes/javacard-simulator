/*!
 * JCSystem
 *
 * The this class includes a collection of methods to control applet execution, resource management,
 * atomic transaction management, object deletion mechanism and inter-applet object sharing in the Java Card
 * environment.
 *
 * @author Adam Noakes
 * University of Southamption
 */

var opcodes = require('../../utilities/opcodes.js');
var processor = require('../../smartcard/processor.js');
var e = require('./Exceptions.js');

module.exports = {
    ARRAY_TYPE_BOOLEAN: 1,
    ARRAY_TYPE_BYTE: 2,
    ARRAY_TYPE_INT: 4,
    ARRAY_TYPE_OBJECT: 5,
    ARRAY_TYPE_SHORT: 3,
    CLEAR_ON_DESELECT: 2,
    CLEAR_ON_RESET: 1,
    MEMORY_TYPE_PERSISTENT: 0,
    MEMORY_TYPE_TRANSIENT_DESELECT: 2,
    MEMORY_TYPE_TRANSIENT_RESET: 1,
    NOT_A_TRANSIENT_OBJECT: 0,

    /**
  	 * Handles javacard.framework.JCSystem api calls.
  	 *
  	 * @param  {Number}    classToken The class token.
  	 * @param  {Number}    method     The method token.
  	 * @param  {Number}    type       The method type token.
  	 * @param  {Array}     param      Params popped from operand stack.
  	 * @param  {JCSystem}  obj        The JCSystem object.
  	 * @param  {SmartCard} smartcard  The smartcard objet.
  	 * @return 						            Error or the result of called function.
  	 */
    run: function(method, type, param, obj, smartcard){
        switch(method){
            case 0://abortTransaction
                return this.abortTransaction(smartcard);
            case 1://beginTransaction
                return this.beginTransaction(smartcard);
            case 2://commitTransaction
                return this.commitTransaction(smartcard);
            case 12://makeTransientBooleanArray
            case 13://makeTransientByteArray
            case 14://makeTransientObjectArray
            case 15://makeTransientShortArray
                return {transientArray: true, array: Array.apply(null, Array(param[0])).map(Number.prototype.valueOf,0)};
            default:
                return new Error('Method ' + method + ' not defined for JCSystem');
        }
    },

    abortTransaction: function (smartcard) {
        if (!smartcard.processor.transaction_flag) {
          return e.getTransactionException(2);
        }
        else {
            smartcard.processor.transaction_flag = false;
            smartcard.RAM.transaction_buffer = [];
        }
    },//00

    beginTransaction: function (smartcard) {
        if (smartcard.processor.transaction_flag) {
          return e.getTransactionException(1);
        }
        else {
          smartcard.processor.transaction_flag = true;
        }
    },//01

    //not sure that this is correct (from robin william's code)
    commitTransaction: function (smartcard) {
        if (!smartcard.processor.transaction_flag) {
          return e.getTransactionException(2);
        }
        else {
            smartcard.processor.transaction_flag = false;
            var transaction;
            for (var j = 0; j < len; j++) {
              transaction = smartcard.RAM.transaction_buffer[j];
              //if it's a set heap instruction
              if(transaction.constructor === Array){
                eeprom.setHeap(smartcard, transaction[0], transaction[1]);
              //else it's a push to heap instruction
              } else {
                eeprom.pushToHeap(smartcard, transaction);
              }
            }
            //reset transaction_buffer
            smartcard.RAM.transaction_buffer = [];
        }
    }
    //02
};
