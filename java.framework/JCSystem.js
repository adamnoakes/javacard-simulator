/* @anoakes
 * The this class includes a collection of methods to control applet execution, resource management, 
 * atomic transaction management, object deletion mechanism and inter-applet object sharing in the Java Card 
 * environment.
 */
var jcvm = require('../jcvm.js');
var opcodes = require('../opcodes.js');

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
    makeTransientBooleanArray: function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; },
                //0C boolArray
    makeTransientByteArray: function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; },
    makeTransientShortArray: function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; },
    //0C boolArray
    makeTransientByteArray: function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; },
                //0D byteArray
    makeTransientObjectArray: function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; },
                //0E objArray
    makeTransientShortArray: function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0; }; return b; },
                //0F shortArray
}