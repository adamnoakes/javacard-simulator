
//A0 00 00 00 62 01 01 Framework
function JCSystem() {
    //Class Token - 08

    JCSystem.ARRAY_TYPE_BOOLEAN = 1;
    JCSystem.ARRAY_TYPE_BYTE = 2;
    JCSystem.ARRAY_TYPE_INT = 4;
    JCSystem.ARRAY_TYPE_OBJECT = 5;
    JCSystem.ARRAY_TYPE_SHORT = 3;
    JCSystem.CLEAR_ON_DESELECT = 2;
    JCSystem.CLEAR_ON_RESET = 1;
    JCSystem.MEMORY_TYPE_PERSISTENT = 0;
    JCSystem.MEMORY_TYPE_TRANSIENT_DESELECT = 2;
    JCSystem.MEMORY_TYPE_TRANSIENT_RESET = 1;
    JCSystem.NOT_A_TRANSIENT_OBJECT = 0;

    JCSystem.abortTransaction = function () {

        if (!transaction_flag) { executeBytecode.exception_handler(jframework, 14, 2); }
        else {
            transaction_flag = false;
            transaction_buffer = [];
        }
        
        return;
    };//00
    JCSystem.beginTransaction = function () {
        if (transaction_flag) { executeBytecode.exception_handler(jframework, 14, 1); }
        else { transaction_flag = true; }

        return;
    };//01
    JCSystem.commitTransaction = function () {
        if (!transaction_flag) { executeBytecode.exception_handler(jframework, 14, 2); }
        else {
            transaction_flag = false;
            var len = transaction_buffer.length;
            for (var j = 0; j < len; j++) {
                var spl = transaction_buffer[j].split(";");
                if (spl.length == 1) {
                    newHeap(spl[0]);
                } else {
                    setHeap(Number(spl[0]), Number(spl[1]));
                }
                
            }
            transaction_buffer = [];
        }

        return;
    };//02

    /*JCSystem.getAID();//03 AID
    JCSystem.getAppletShareableInterfaceObject(bb, s);//04 Shareable
    JCSystem.getMaxCommitCapacity();//05 short
    JCSystem.getPreviousContextAID();//06 AID
    JCSystem.getTransactionDepth();//07 byte
    JCSystem.getUnusedCommitCapacity();//08 short
    JCSystem.getVersion();//09 short
    JCSystem.isTransient(bb);//0A byte
    JCSystem.lookupAID(ba, s, s);//0B */

    JCSystem.makeTransientBooleanArray = function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; };
                //0C boolArray
    JCSystem.makeTransientByteArray = function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; };
                //0D byteArray
    JCSystem.makeTransientObjectArray = function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0 }; return b; };
                //0E objArray
    JCSystem.makeTransientShortArray = function (length, event) { var b = []; for (var j = 0; j < length; j++) { b[j] = 0; }; return b; };
                //0F shortArray

    /*JCSystem.getAvailableMemory(s);//10 short
    JCSystem.isObjectDeletionSupported();//11 boolean
    JCSystem.requestObjectDeletion(); //12
    JCSystem.getAssignedChannel();//13 byte
    JCSystem.isAppletActive(bb);//14 byte*/

}