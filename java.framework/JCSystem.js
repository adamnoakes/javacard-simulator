/* @anoakes
 * The this class includes a collection of methods to control applet execution, resource management, 
 * atomic transaction management, object deletion mechanism and inter-applet object sharing in the Java Card 
 * environment.
 */
var jcvm = require('../jcvm.js');
var opcodes = require('../opcodes.js');

//A0 00 00 00 62 01 01 Framework
function JCSystem(EEPROM, RAM) {
    //Class Token - 08
    this.RAM = RAM;
    this.EEPROM = EEPROM;
    this.ARRAY_TYPE_BOOLEAN = 1;
    this.ARRAY_TYPE_BYTE = 2;
    this.ARRAY_TYPE_INT = 4;
    this.ARRAY_TYPE_OBJECT = 5;
    this.ARRAY_TYPE_SHORT = 3;
    this.CLEAR_ON_DESELECT = 2;
    this.CLEAR_ON_RESET = 1;
    this.MEMORY_TYPE_PERSISTENT = 0;
    this.MEMORY_TYPE_TRANSIENT_DESELECT = 2;
    this.MEMORY_TYPE_TRANSIENT_RESET = 1;
    this.NOT_A_TRANSIENT_OBJECT = 0;

    this.abortTransaction = function () {

        if (!this.RAM.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 2); }
        else {
            this.RAM.transaction_flag = false;
            this.RAM.transaction_buffer = [];
        }
        
        return;
    };//00
    this.beginTransaction = function () {
        if (this.RAM.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 1); }
        else { this.RAM.transaction_flag = true; }

        return;
    };//01
    this.commitTransaction = function () {//TODO --> Execution handler convert to hex array for jframework
        if (!this.RAM.transaction_flag) { jcvm.executeBytecode.exception_handler(opcodes.jframework, 14, 2); }
        else {
            this.RAM.transaction_flag = false;
            var len = this.RAM.transaction_buffer.length;
            for (var j = 0; j < len; j++) {
                var spl = this.RAM.transaction_buffer[j].split(";");//why split on ;
                if (spl.length == 1) {
                    this.EEPROM.newHeap(spl[0]);
                } else {
                    this.EEPROM.setHeap(Number(spl[0]), Number(spl[1]));
                }
                
            }
            this.RAM.transaction_buffer = [];
        }

        return;
    };//02

    /*this.getAID();//03 AID
    this.getAppletShareableInterfaceObject(bb, s);//04 Shareable
    this.getMaxCommitCapacity();//05 short
    this.getPreviousContextAID();//06 AID
    this.getTransactionDepth();//07 byte
    this.getUnusedCommitCapacity();//08 short
    this.getVersion();//09 short
    this.isTransient(bb);//0A byte
    this.lookupAID(ba, s, s);//0B */

    this.makeTransientBooleanArray = function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; };
                //0C boolArray
    this.makeTransientByteArray = function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; };
                //0D byteArray
    this.makeTransientObjectArray = function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; };
                //0E objArray
    this.makeTransientShortArray = function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0; }; return b; };
                //0F shortArray

    /*this.getAvailableMemory(s);//10 short
    this.isObjectDeletionSupported();//11 boolean
    this.requestObjectDeletion(); //12
    this.getAssignedChannel();//13 byte
    this.isAppletActive(bb);//14 byte*/

}

exports.JCSystem =JCSystem;