var opcodes = require('./opcodes.js');
var AID = require('../framework/AID.js').AID;
var Applet = require('../framework/Applet.js').Applet;//TODO --> Finish all imports
var apdu = require('../framework/APDU.js');
var Util = require('../framework/Util.js');
var aid = require('../framework/AID.js');
var JCSystem = require('../framework/JCSystem.js');
var eeprom = require('../smartcard/eeprom.js');
var ram = require('../smartcard/ram.js');
var processor = require('../smartcard/processor.js');

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
                    obj = new apdu.APDU();
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

function runMethod (id, clas, method, type, param, obj, objref, smartcard) {
    switch (id.join()) {
        case opcodes.jlang.join(): //lang
            switch (clas) {
                case 0:  //Object
                    return obj;
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

                    if (method === 0) {
                        return obj.constr();
                    }
                    throw "ArrayStoreException";
                default:
                    alert("unsupported class");
            }

            break;
        case opcodes.jframework.join(): //Framework

            switch (clas) {
                case 3:  //Applet abstract class
                    switch(method) {
                        case 0://protected Applet()
                            return Applet.constr();
                        case 1://public static install()
                                //protected final register() 

                            //obj.reg();
                            //EEPROM.registerApplet();
                            return eeprom.addInstalledApplet(smartcard.EEPROM, smartcard.RAM.installingAppletAID, smartcard.RAM.gRef);//ISSUE
                        case 2://protected final register(BSB) 
                            //obj.register(param[0], param[1], param[2]);
                            return;
                        case 3://protected final selectingApplet() -> boolean
                            return ram.getSelectStatementFlag(smartcard.RAM);//obj.selectingApplet();
                        case 4://public deselect()
                        case 5://public getShareableInterfaceObject(clientAID, parameter) -> Shareable
                        case 6://public select() -> boolean
                        case 7://public abstract process(APDU) -> void
                            break;
                        default:
                            throw "Method not defined";
                    }
                    break;
                case 4:  //CardException
                    if (method === 0) {
                        return obj.constr(param[0]); //void
                    } else { CardException.throwIt(param[0]); }
                    break;
                case 5:  //CardRuntimeException
                    if (method === 0) {
                        return obj.constr(param[0]);//void 
                    } else { CardRuntimeException.throwIt(param[0]); }
                    break;
                case 6:  //AID
                    switch (method) {
                        case 0://void
                            return aid.constr(obj, param[0],param[1],param[2]);
                        case 1://normal
                            return aid.RIDEquals(obj, param[0]);
                        case 2:
                            return aid.equals(obj, param[0],param[1],param[2]);
                        case 3:
                            return aid.getBytes(obj, param[0], param[1]);
                        case 4:
                            return aid.PartialEquals(obj, param[0], param[1], param[2]);
                        case 5:
                            return aid.getPartialEquals(obj, param[0],param[1],param[2],param[3]);
                        default:
                            throw "Method not defined";
                    }
                    break;
                case 7:  //ISOException
                    if (method === 0) {
                        return obj.constr(param[0]);//void
                    } else { 
                        ISOException.throwIt(param[0]);
                    }
                    break;
                case 8:  //JCSystem
                    switch (method) {
                        case 0://void
                            return processor.abortTransaction(smartcard);
                        case 1://void
                            return processor.beginTransaction(smartcard);
                        case 2://void
                            return processor.commitTransaction(smartcard);
                        case 12://transient array
                            return {type: 2, array: JCSystem.makeTransientBooleanArray(param[0], param[1])};
                        case 13://transient array
                            return {type: 2, array: JCSystem.makeTransientByteArray(param[0], param[1])};
                        case 14://transient array
                            return {type: 2, array: JCSystem.makeTransientObjectArray(param[0], param[1])};
                        case 15:
                            return {type: 2, array: JCSystem.makeTransientShortArray(param[0], param[1])};
                        default:
                            throw "Method not defined";
                    }
                    break;
                case 9:  //OwnerPIN
                    switch (method) {
                        case 0://void
                            return obj.constr(param[0], param[1]);
                        case 1://normal
                            return obj.check(param[0], param[1], param[2]);
                        case 2://normal
                            return obj.getTriesRemaining();
                        case 4://normal
                            return obj.isValidated();
                        case 5://void
                            return obj.reset();
                        case 6://void
                            return obj.resetAndUnblock();
                        case 8://void
                            return obj.update(param[0], param[1], param[2]);
                        default:
                            throw "Method not defined";
                    }
                    break;
                case 10:  //APDU
                    switch (type) {
                        case 3:
                            switch (method) {
                                case 0://void
                                    return apdu.constr(obj, param[0]);
                                    //objectheap.push(new APDU(param[0]));
                                    break;
                                case 1://normal
                                    //retval = obj.getBuffer();
                                    return "H" + objref + "#" + 1 + "#" + apdu.getArrayLength(obj, 1);
                                case 2:
                                    return apdu.getNAD();
                                case 3:
                                    return apdu.receiveBytes(obj, param[0]);
                                case 4://void
                                    return apdu.sendBytes(obj, param[0], param[1]);
                                case 5://void
                                    return apdu.sendBytesLong(obj, param[0], param[1], param[2]);
                                case 6://void
                                    return apdu.setIncomingAndReceive(obj);
                                case 7:
                                    return apdu.setOutgoing(obj);
                                case 8://void
                                    return apdu.setOutgoingAndSend(obj, param[0], param[1]);
                                case 9://void
                                    return apdu.setOutgoingLength(obj, param[0]);
                                case 10:
                                    return apdu.setOutgoingNoChaining();
                                case 11:
                                    return apdu.getCurrentState(obj);
                                case 12:
                                    return apdu.isCommandChainingCLA(obj);
                                case 13:
                                    return apdu.isSecureMessagingCLA(obj);
                                case 14:
                                    return apdu.isISOInterindustryCLA(obj);
                                case 15:
                                    return apdu.getIncomingLength(obj);
                                case 16:
                                    return apdu.getOffsetCdata(obj);
                                default:
                                    throw "Method not defined";
                            }
                            //intentional break missing? :/
                        case 6:
                            switch (method) {
                                case 0:
                                    return apdu.getInBlockSize(obj);
                                case 1:
                                    return apdu.getOutBlockSize(obj);
                                case 2:
                                    return apdu.getProtocol(obj);
                                case 3:
                                    return apdu.waitExtension(obj);
                                case 4:
                                    return 0;//APDU.getCurrentAPDU();
                                case 3://array
                                    return apdu.getBuffer(obj);// adam maybe need to be stored in ram APDU.getCurrentAPDUBuffer();
                                case 5://normal
                                    return apdu.getCLAChannel(obj);
                                default:
                                    throw "Method not defined";
                            }
                    }
                    break;
                case 11:  //PINException
                    if (method === 0) {
                        return obj.constr(param[0]);//void
                    } else {
                        PINException.throwIt(param[0]);
                    }
                    throw "Exception";
                case 12:  //APDUException
                    if (method === 0) {
                        return obj.constr(param[0]);//void
                    } else {
                        APDUException.throwIt(param[0]);
                    }
                    throw "Exception";
                case 13:  //SystemException
                    if (method === 0) {
                        return obj.constr(param[0]);//void
                    } else {
                        SystemException.throwIt(param[0]);
                    }
                    throw "Exception";
                case 14:  //TransactionException
                    if (method === 0) {
                        return obj.constr(param[0]);//void
                    } else {
                        TransactionException.throwIt(param[0]);
                    }
                    throw "Exception";
                case 15:  //UserException
                    if (method === 0) {
                        return obj.constr(param[0]);
                    } else {
                        UserException.throwIt(param[0]);
                    }
                    throw "Exception";
                case 16:  //Util
                    switch (method) {
                        case 0:
                            return Util.arrayCompare(param[0], param[1], param[2], param[3], param[4], smartcard);
                        case 1:
                            return Util.arrayCopy(param[0], param[1], param[2], param[3], param[4], smartcard);
                        case 2:
                            return Util.arrayCopyNonAtomic(param[0], param[1], param[2], param[3], param[4], smartcard);
                        case 3:
                            return Util.arrayFillNonAtomic(param[0], param[1], param[2], param[3], smartcard);
                        case 4:
                            return Util.getShort(param[0], param[1], smartcard);
                        case 5:
                            return Util.makeShort(param[0], param[1]);
                        case 6:
                            return Util.setShort(param[0], param[1], param[2], smartcard);
                        default:
                            throw "Exception";
                    }
                    break;
                default:
                    throw "Unsupported class";
            }
            break;
        case jsecurity:
        case jxcrypto:
        default:
            throw "Unsupported package";
            break;
    }
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