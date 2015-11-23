var opcodes = require('./opcodes.js');
var AID = require('./java.framework/AID.js').AID;
var Applet = require('./java.framework/Applet.js').Applet;//TODO --> Finish all imports
var APDU = require('./java.framework/APDU.js').APDU;
var Util = require('./java.framework/Util.js');
var JCSystem = require('./java.framework/JCSystem.js');

function newAPIObject(lib,cls) {
   
    var obj;
    switch (lib.join()) {
        case opcodes.jframework.join():

            switch (cls) {
                case 3:
                    obj = new Applet();
                    break;
                case 6:
                    obj = new AID();
                    break;
                case 9:
                    obj = new OwnerPIN();
                    break;
                case 10:
                    obj = new APDU();
                    break;
                default:
                    break;
            }
            break;
        case opcodes.jlang.join():
            switch (cls) {
                case 0:
                    obj = new Object();
                    break;
                case 1:
                    obj = new Throwable();
                    break;
                case 2:
                    obj = new Exception();
                    break;
                case 3:
                    obj = new RuntimeException();
                    break;
                case 4:
                    obj = new IndexOutOfBoundsException();
                    break;
                case 5:
                    obj = new ArrayIndexOutOfBoundsException();
                    break;
                case 6:
                    obj = new NegativeArraySizeException();
                    break;
                case 7:
                    obj = new NullPointerException();
                    break;
                case 8:
                    obj = new ClassCastException();
                    break;
                case 9:
                    obj = new ArithmeticException();
                    break;
                case 10:
                    obj = new SecurityException();
                    break;
                case 11:
                    obj = new ArrayStoreException();
                    break;

            }
            break;
        case opcodes.jsecurity.join():


            break;
        case opcodes.jxcrypto.join():


            break;
        default:
    }
    //APISave(objectheap.length, obj.save()); not saving apis any more
    //objectheap.push(obj);
    return obj;
}

exports.newAPIObject = newAPIObject; //TODO --> replace with module.exports for one below too //TODO --> replace processor with processor and add processor functions

function runMethod (id, clas, method, type, param, objectheap, objref, processor) {
    var bbb = "";
    var pm = "";
    var retval;
    var rettype;
    switch (id.join()) {
        case opcodes.jlang.join(): //lang
            switch (clas) {
                case 0:  //Object
                    obj = objectheap[objref];
                    retval = "";
                    rettype = 0;
                    break;
                case 1:  //Throwable
                case 2:  //Exception
                case 3:  //RuntimeException
                case 4:  //IndexOutOfBoundsException 
                case 5:  //ArrayIndexOutOfBoundsException
                case 6:  //NegativeArraySizeException
                case 7:  //NullPointerException
                case 8:  //ClassCastException
                case 9:  //ArithmeticException
                case 10:  //SecurityException
                case 11:  //ArrayStoreException

                    if (method == 0) {
                        obj = objectheap[objref];
                        obj.constr();
                        retval = "";
                        rettype = 0;
                    }

                    break;
                default:
                    alert("unsupported class");
            }

            break;
        case opcodes.jframework.join(): //Framework

            switch (clas) {
                case 3:  //Applet

                    obj = objectheap[objref];
                    switch(method) {
                        case 0:
                            Applet.constr();
                            retval = "";
                            rettype = 0;
                            break;
                        case 1:

                            //obj.reg();
                            //EEPROM.registerApplet();
                            processor.addInstalledApplet();//ISSUE
                            rettype = 0;
                            retval = "";
                            break;
                        case 2:
                            //obj.register(param[0], param[1], param[2]);
                            rettype = 0;
                            retval = "";
                            break;
                        case 3:
                            retval = processor.getSelectStatementFlag;//obj.selectingApplet();
                            rettype = 1;
                            break;
                        case 4:
                        case 5:
                        case 6:
                        case 7:
                        default:
                            retval = "";
                    }

                    objectheap[objref] = obj;
                    break;
                case 4:  //CardException
                    if (method == 0) {
                        obj = objectheap[objref];
                        obj.constr(param[0]);
                    } else { CardException.throwIt(param[0]); }
                    retval = "";
                    rettype = 0;
                    break;
                case 5:  //CardRuntimeException
                    if (method == 0) {
                        obj = objectheap[objref];
                        obj.constr(param[0]);
                    } else { CardRuntimeException.throwIt(param[0]); }
                    retval = "";
                    rettype = 0;
                    break;
                case 6:  //AID
                    obj = objectheap[objref];
                    switch (method) {
                        case 0:
                            AID.constr(param[0],param[1],param[2]);
                            retval = "";
                            rettype = 0;
                            break;
                        case 1:
                            retval = obj.RIDEquals(param[0]);
                            rettype = 1;
                            break;
                        case 2:
                            retval = obj.equals(param[0],param[1],param[2]);
                            rettype = 1;
                            break;
                        case 3:
                            retval = obj.getBytes(param[0], param[1]);
                            rettype = 1;
                            break;
                        case 4:
                            retval = obj.PartialEquals(param[0], param[1], param[2]);
                            rettype = 1;
                            break;
                        case 5:
                            retval = obj.getPartialEquals(param[0],param[1],param[2],param[3]);
                            rettype = 1;
                            break;
                    }

                    objectheap[objref] = obj;
                    break;
                case 7:  //ISOException
                    if (method == 0) {
                        obj = objectheap[objref];
                        obj.constr(param[0]);
                    } else { ISOException.throwIt(param[0]);}
                    retval = "";
                    rettype = 0;
                    break;
                case 8:  //JCSystem

                    switch (method) {
                        case 0:
                            processor.abortTransaction();
                            retval = "";
                            rettype = 0;
                            break;
                        case 1:
                            processor.beginTransaction();
                            retval = "";
                            rettype = 0;
                            break;
                        case 2:
                            processor.commitTransaction();
                            retval = "";
                            rettype = 0;
                            break;
                        case 12:
                            rettype = 2;
                            retval = JCSystem.makeTransientBooleanArray(param[0], param[1]);
                            break;
                        case 13:
                            rettype = 2;
                            retval = JCSystem.makeTransientByteArray(param[0], param[1]);
                            break;
                        case 14:
                            rettype = 2;
                            retval = JCSystem.makeTransientObjectArray(param[0], param[1]);
                            break;
                        case 15:
                            rettype = 2;
                            retval = JCSystem.makeTransientShortArray(param[0], param[1]);

                            break;
                        default:
                            retval = "";
                    }
                    break;
                case 9:  //OwnerPIN

                    obj = objectheap[objref];
                    switch (method) {
                        case 0:
                            obj.constr(param[0], param[1]);
                            rettype = 0;
                            retval = "";
                            break;
                        case 1:
                            retval = obj.check(param[0], param[1], param[2]);
                            rettype = 1;
                            break;
                        case 2:
                            retval = obj.getTriesRemaining();
                            rettype = 1;
                            break;
                        case 4:
                            retval = obj.isValidated();
                            rettype = 1;
                            break;
                        case 5:
                            obj.reset();
                            rettype = 0;
                            retval = "";
                            break;
                        case 6:
                            obj.resetAndUnblock();
                            rettype = 0;
                            retval = "";
                            break;
                        case 8:
                            obj.update(param[0], param[1], param[2]);
                            rettype = 0;
                            retval = "";
                            break;
                    }

                    objectheap[objref] = obj;
                    break;
                case 10:  //APDU

                    obj = objectheap[objref];

                    switch (type) {
                        case 3:
                            switch (method) {
                                case 0:
                                    retval = "";//objectheap.length;
                                    rettype = 0;
                                    obj.constr(param[0]);
                                    //objectheap.push(new APDU(param[0]));
                                    break;
                                case 1:
                                    //retval = obj.getBuffer();

                                    retval = "H" + objref + "#" + 1 + "#" + obj.getArrayLength(1);

                                    bbb = retval;
                                    rettype = 1;
                                    break;
                                case 2:
                                    retval = obj.getNAD();
                                    rettype = 1;
                                    break;
                                case 3:
                                    retval = obj.receiveBytes(param[0]);
                                    rettype = 1;
                                    break;
                                case 4:
                                    obj.sendBytes(param[0], param[1]);
                                    retval = "";
                                    rettype = 0;
                                    break;
                                case 5:
                                    obj.sendBytesLong(param[0], param[1], param[2]);
                                    retval = "";
                                    rettype = 0;
                                    break;
                                case 6:
                                    retval = obj.setIncomingAndReceive();
                                    rettype = 1;
                                    break;
                                case 7:
                                    retval = obj.setOutgoing();
                                    rettype = 1;
                                    break;
                                case 8:
                                    obj.setOutgoingAndSend(param[0], param[1]);
                                    retval = "";
                                    rettype = 0;
                                    break;
                                case 9:
                                    obj.setOutgoingLength(param[0]);
                                    retval = "";
                                    rettype = 0;
                                    break;
                                case 10:
                                    retval = obj.setOutgoingNoChaining();
                                    rettype = 1;
                                    break;
                                case 11:
                                    retval = obj.getCurrentState();
                                    rettype = 1;
                                    break;
                                case 12:
                                    retval = obj.isCommandChainingCLA();
                                    rettype = 1;
                                    break;
                                case 13:
                                    retval = obj.isSecureMessagingCLA();
                                    rettype = 1;
                                    break;
                                case 14:
                                    retval = obj.isISOInterindustryCLA();
                                    rettype = 1;
                                    break;
                                case 15:
                                    retval = obj.getIncomingLength();
                                    rettype = 1;
                                    break;
                                case 16:
                                    retval = obj.getOffsetCdata();
                                    rettype = 1;
                                    break;
                            }

                            objectheap[objref] = obj;
                            //intentional break missing? :/
                        case 6:
                            switch (method) {
                                case 0:
                                    retval = APDU.getInBlockSize();
                                    rettype = 1;
                                    break;
                                case 1:
                                    retval = APDU.getOutBlockSize();
                                    rettype = 1;
                                    break;
                                case 2:
                                    retval = APDU.getProtocol();
                                    rettype = 1;
                                    break;
                                case 3:
                                    retval = APDU.waitExtension();
                                    rettype = 1;
                                    break;
                                case 4:
                                    retval = 0;//APDU.getCurrentAPDU();
                                    rettype = 1;
                                    break;
                                case 3:
                                    retval = obj.getBuffer();// adam maybe need to be stored in ram APDU.getCurrentAPDUBuffer();
                                    rettype = 3;
                                    break;
                                case 5:
                                    retval = obj.getCLAChannel();
                                    rettype = 1;
                                    break;
                            }
                    }

                    if (bbb.length > 0) { retval = bbb;}
                    break;
                case 11:  //PINException
                    if (method == 0) {
                        obj = objectheap[objref];
                        obj.constr(param[0]);
                    } else { PINException.throwIt(param[0]); }
                    retval = "";
                    rettype = 0;
                    break;
                case 12:  //APDUException
                    if (method == 0) {
                        obj = objectheap[objref];
                        obj.constr(param[0]);
                    } else { APDUException.throwIt(param[0]); }
                    retval = "";
                    rettype = 0;
                    break;
                case 13:  //SystemException
                    if (method == 0) {
                        obj = objectheap[objref];
                        obj.constr(param[0]);
                    } else { SystemException.throwIt(param[0]); }
                    retval = "";
                    rettype = 0;
                    break;
                case 14:  //TransactionException
                    if (method == 0) {
                        obj = objectheap[objref];
                        obj.constr(param[0]);
                    } else { TransactionException.throwIt(param[0]); }
                    retval = "";
                    rettype = 0;
                    break;
                case 15:  //UserException
                    if (method == 0) {
                        obj = objectheap[objref];
                        obj.constr(param[0]);
                    } else { UserException.throwIt(param[0]); }
                    retval = "";
                    rettype = 0;
                    break;
                case 16:  //Util

                    rettype = 1;
                    switch (method) {
                        case 0:
                            retval = Util.arrayCompare(param[0], param[1], param[2], param[3], param[4], processor);
                            break;
                        case 1:
                            retval = Util.arrayCopy(param[0], param[1], param[2], param[3], param[4], processor);
                            break;
                        case 2:
                            retval = Util.arrayCopyNonAtomic(param[0], param[1], param[2], param[3], param[4], processor);
                            break;
                        case 3:
                            retval = Util.arrayFillNonAtomic(param[0], param[1], param[2], param[3], processor);
                            break;
                        case 4:
                            retval = Util.getShort(param[0], param[1], processor);
                            break;
                        case 5:
                            retval = Util.makeShort(param[0], param[1]);
                            break;
                        case 6:
                            retval = Util.setShort(param[0], param[1], param[2], processor);
                            break;
                    }

                    break;

                default:
                    alert("unsupported class");
            }

            break;
        case jsecurity:
        case jxcrypto:
        default:
            alert("unsupported package (runMethod)");
            break;
    }

    return {'typ': rettype, 'val': retval};
}

exports.runMethod = runMethod;

function nargAPI (id, clas, method, type) {
    //This function returns the number of argument required by the method
    //is used to determine how many to pop from the operand stack
    var obj;
    //Framework
    switch (id.join()) {
        case opcodes.jlang.join(): //lang
            switch (clas) {
                case 0:  //Object
                case 1:  //Throwable
                case 2:  //Exception
                case 3:  //RuntimeException
                case 4:  //IndexOutOfBoundsException 
                case 5:  //ArrayIndexOutOfBoundsException
                case 6:  //NegativeArraySizeException
                case 7:  //NullPointerException
                case 8:  //ClassCastException
                case 9:  //ArithmeticException
                case 10:  //SecurityException
                case 11:  //ArrayStoreException
                    return 0;
                    break;
                default:
                    alert("unsupported class");
            }

            break;
        case opcodes.jframework.join(): //Framework

            switch (clas) {
                case 3:  //Applet

                    switch (method) {
                        case 2:
                            return 3;
                        case 5:
                            return 2;
                        case 7:
                            return 1;
                        default:
                            return 0;
                    }

                    break;
                case 4:  //CardException
                case 5:  //CardRuntimeException
                    if (method == 0) { return 0; } else { return 1; }
                case 6:  //AID
                    switch (method) {
                        case 0:
                            return 1;
                        case 1:
                            return 1;
                        case 2:
                            return 3;
                        case 3:
                            return 2;
                        case 4:
                            return 3;
                        case 5:
                            return 4;
                    }
                case 7:  //ISOException
                    if (method == 0) { return 0; } else { return 1; }
                    break;
                case 8:  //JCSystem
                    switch (method) {
                        case 12:
                            return 2;
                        case 13:
                            return 2;
                        case 14:
                            return 2;
                        case 15:
                            return 2;
                        default:
                            return 0;
                    }
                    break;
                case 9:  //OwnerPIN
                    switch (method) {
                        case 0:
                            return 2;
                        case 1:
                            return 3;
                        case 8: 
                            return 3;
                        default:
                            return 0;

                    }


                    break;
                case 10:  //APDU
                    switch (type) {
                        case 3:
                            switch (method) {
                                case 0:
                                    return 1;
                                case 3:
                                    return 1;
                                case 4:
                                    return 2;
                                case 5:
                                    return 3;
                                case 8:
                                    return 2;
                                case 9:
                                    return 1;
                                default:
                                    return 0;
                            }
                        case 6:
                            return 0;

                    }

                case 11:  //PINException
                case 12:  //APDUException
                case 13:  //SystemException
                case 14:  //TransactionException
                case 15:  //UserException
                    if (method == 0) { return 0; } else { return 1; }
                case 16:  //Util

                    switch(method) {
                        case 1: return 5;
                        case 2: return 5;
                        case 3: return 5;
                        case 4: return 4;
                        case 5: return 2;
                        case 6: return 3;
                        case 7: return 3;
                    }
                default:
                    alert("unsuported class");
            }

            break;
        case opcodes.jsecurity.join():
        case opcodes.jxcrypto.join():
        default:
            alert("unsupported package " + id);
            break;
    }
}

exports.nargAPI = nargAPI;