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

//this class needs work
var opcodes = require('../../utilities/opcodes.js');
var processor = require('../../smartcard/processor.js');

//A0 00 00 00 62 01 01 Framework
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
     * Handles javacard.framework JCSystem api calls.
     */
    run: function(method, type, param, obj, smartcard){
        switch(method){
            case 0://abortTransaction
                return processor.abortTransaction(smartcard);
            case 1://beginTransaction
                return processor.beginTransaction(smartcard);
            case 2://commitTransaction
                return processor.commitTransaction(smartcard);
            case 12://makeTransientBooleanArray
            case 13://makeTransientByteArray
            case 14://makeTransientObjectArray
            case 15://makeTransientShortArray
                return {transientArray: true, array: Array.apply(null, Array(param[0])).map(Number.prototype.valueOf,0)};
            default:
                return new Error('Method ' + method + ' not defined for JCSystem');
        }
    }
};
