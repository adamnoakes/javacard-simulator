//Code mostly converted from pythoncard project https://bitbucket.org/benallard/pythoncard/
/*!
 * APDU
 * @author Adam Noakes
 * @author Robin Williams
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var ISO7816 = require('./ISO7816.js');
var e = require('./Exceptions.js');
/**
 * Constants
 * @private
 */

var STATE_INITIAL = 0;
var STATE_PARTIAL_INCOMING = 1;
var STATE_FULL_INCOMING = 2; 
var STATE_OUTGOING = 3;
var STATE_OUTGOING_LENGTH_KNOWN = 4;
var STATE_PARTIAL_OUTGOING = 5;
var STATE_FULL_OUTGOING = 6;
var STATE_ERROR_IO = -1;
var STATE_ERROR_NO_T0_GETRESPONSE = -2;
var STATE_ERROR_NO_T0_REISSUE = -3;
var STATE_ERROR_T1_IFD_ABORT = -4;
var PROTOCOL_MEDIA_CONTACTLESS_TYPE_A = 0;
var PROTOCOL_MEDIA_CONTACTLESS_TYPE_B = 1;
var PROTOCOL_MEDIA_DEFAULT = 2;
var PROTOCOL_MEDIA_MASK = 3;
var PROTOCOL_MEDIA_USB = 4;
var PROTOCOL_T0 = 5;
var PROTOCOL_T1 = 6;
var PROTOCOL_TYPE_MASK = 7;
var IN_BLOCKSIZE = 0x80;
var OUT_BLOCKSIZE = 0x100;
var cls = 10;


/**
 * Module exports.
 * @public
 */

module.exports = {
    APDU: function() {
        this.state = STATE_INITIAL;
        this.broken = false;
        this.type = 0;
        this.Nc = 0;
        this.Ne = 0;
        this.leLength = 0;
        this.lcLength = 0;
        this.currentDataOffset = 0;
        this.buffer = [];
        this.P3len = 0;
        this.offSetIncoming = 4;
        this.currentOutgoingLength = 0;
    },
    run: function(method, type, param, obj){
        switch (type) {
            case 3://object methods
                return runObjectMethod(method, param, obj);
            case 6://static methods
                return runStaticMethod(method, param, obj);
            default:
                return new Error('Method ' + method + ' not defined for AID');
        }
    },
    setArray: function(APDU, arr, index, value) { 
        if (arr == 1) {
            APDU.buffer[index] = value;
        }
    },
    getArray: function(APDU, arr, index) {
        if (arr == 1) {
            return APDU.buffer[index];
        }
    },
    constr: function(apdu, bArray) {
        apdu._buffer = bArray;
        apdu.buffer = [];//Array.apply(null, Array(255 + 2)).map(Number.prototype.valueOf,0);

        for(var i = 0; i<4; i++){
            apdu.buffer[i] = bArray[i];
        }
        apdu.offSetIncoming = 4;
        if(bArray.length > 4){
            if(bArray[ISO7816.get('OFFSET_LC')] === 0 && bArray.length > ISO7816.get('OFFSET_LC') + 3){
                this.P3len = 3;
            } else {
                this.P3len = 1;
            }
            for(i = ISO7816.get('OFFSET_LC'); i< ISO7816.get('OFFSET_LC') + this.P3len; i++){
                apdu.buffer[i] = bArray[i];
            }
            apdu.offSetIncoming += this.P3len;
        }
        apdu.state = STATE_INITIAL;
        apdu.broken = false;

        var temp;
        apdu.currentDataOffset = ISO7816.get('OFFSET_CDATA');
        if(bArray.length === 4){
            apdu.type = 1;
            apdu.Nc = 0;
            apdu.Ne = null;
            apdu.leLength = 0;
        } else if(bArray.length ===5 ||
            (apdu._buffer[4] === 0 && bArray.length === 7)){
            apdu.type = 2;
            apdu.Nc = 0;
            temp = getOutLengths(apdu, bArray.length);
            apdu.Ne = temp[0];
            apdu.leLength = temp[1];
        } else if(bArray.length === apdu._buffer[4] + 5 ||
            bArray.length === getInLengths(apdu)[0] + 5) {
            apdu.type = 3;
            temp = getInLengths(apdu);
            apdu.Nc = temp[0];
            apdu.lcLength = temp[1];
            apdu.Ne = null;
            apdu.leLength = 0;
            apdu.currentDataOffset += apdu.lcLength -1;
        } else {
            apdu.type = 4;
            temp = getInLengths(apdu);
            apdu.Nc = temp[0];
            apdu.lcLength = temp[1];
            temp = getOutLengths(apdu, bArray.length);
            apdu.Ne = temp[0];
            apdu.leLength = temp[1];
            apdu.currentDataOffset += apdu.lcLength - 1;

            //if((4 + apdu.lcLength + apdu.leLength + apdu.Nc) !== bArray.length){
            //    apdu.broken = false;
            //}

            apdu.outgoingLength = 0;
        }
    },
    getCurrentState: function(APDU) {
        return APDU.state;
    },
    getBuffer: getBuffer
};

/**
 * Private functions
 * @private;
 */

function runObjectMethod(method, param, obj){
    switch(method){
        case 0://void
            return constr(obj, param[0]);
            //objectheap.push(new APDU(param[0]));
        case 1://normal
            //retval = obj.getBuffer();
            //instead returns the memorylocation of buffer.
            //return "H" + objref + "#" + 1 + "#" + getArrayLength(obj, 1);
            return getBuffer(obj);
        case 2:
            return getNAD();
        case 3:
            return receiveBytes(obj, param[0]);
        case 4://void
            return sendBytes(obj, param[0], param[1]);
        case 5://void
            return sendBytesLong(obj, param[0], param[1], param[2]);
        case 6://void
            return setIncomingAndReceive(obj);
        case 7:
            return setOutgoing(obj);
        case 8://void
            return setOutgoingAndSend(obj, param[0], param[1]);
        case 9://void
            return setOutgoingLength(obj, param[0]);
        case 10:
            return setOutgoingNoChaining();
        case 11:
            return getCurrentState(obj);
        case 12:
            return isCommandChainingCLA(obj);
        case 13:
            return isSecureMessagingCLA(obj);
        case 14:
            return isISOInterindustryCLA(obj);
        case 15:
            return getIncomingLength(obj);
        case 16:
            return getOffsetCdata(obj);
        default:
            return new Error('Method ' + method + ' not defined for AID');
    }
}

function runStaticMethod(method, param, obj){
    switch (method) {
        case 0:
            return getInBlockSize();
        case 1:
            return getOutBlockSize();
        case 2:
            return getProtocol();
        case 3:
            return waitExtension(obj);
        case 4:
            return 0;//APDU.getCurrentAPDU();
        case 3://array
            return getBuffer(obj);// adam maybe need to be stored in ram APDU.getCurrentAPDUBuffer();
        case 5://normal
            return getCLAChannel(obj);
        default:
            return new Error('Method ' + method + ' not defined for AID');
    }
}

/**
 * ADAM'S CODE ENDS HERE
 */

/**
 * ROBIN'S CODE
 */

function getInLengths(apdu){
    var temp = [];
    if(apdu._buffer[ISO7816.get('OFFSET_LC')] === 0){
        temp[0] = apdu._buffer[ISO7816.get('OFFSET_LC') + 1] * 256 + 
        apdu._buffer[ISO7816.get('OFFSET_LC') + 2];
        temp[1] = 3;
    } else {
        temp[0] = apdu._buffer[ISO7816.get('OFFSET_LC')];
        temp[1] = 1;
    }
    return temp;
}

function getOutLengths(apdu, length){
    length -= 1;
    if(apdu._buffer[length] === 0){
        if(length !== ISO7816.get('OFFSET_LC') &&
            apdu._buffer[ISO7816.get('OFFSET_LC')] === 0 && 
            apdu._buffer[length -1 ] === 0){
            return [65536, 2];
        }
        return [256,1];
    } else {
        if(length !== ISO7816.get('OFFSET_LC') &&
            apdu._buffer[ISO7816.get('OFFSET_LC')] === 0){
            return [apdu._buffer[length - 1] * 256 +
            apdu._buffer[length], 2];
        }
        return [apdu._buffer[length], 1];
    }
}

function getBuffer(apdu) {
    return apdu.buffer;
}

/**
 * Static methods
 * @static
 */
function getInBlockSize() {
    return IN_BLOCKSIZE;
}

function getOutBlockSize() {
    return OUT_BLOCKSIZE;
}

function getProtocol() {
    return (PROTOCOL_MEDIA_DEFAULT << 4) | PROTOCOL_T1;
}

function getNAD(){
    return;
}

function setIncomingAndReceive(apdu){
    if (apdu.state !== STATE_INITIAL){
        return e.getAPDUException(6);//ILLEAGAL_USE
    }
    if (apdu.broken){
        return e.getISOException(ISO7816.get('SW_WRONG_LENGTH'));
    }

    var toBeProcessed = Math.min(IN_BLOCKSIZE, apdu._buffer.length - apdu.offSetIncoming - apdu.leLength);
    for (var i = 0; i < toBeProcessed; i++) {
        apdu.buffer[apdu.offSetIncoming + i] = apdu._buffer[apdu.offSetIncoming + i];
    }
    apdu.offSetIncoming += toBeProcessed;

    if (apdu.offSetIncoming === (apdu._buffer.length - apdu.leLength)){
        apdu.state = STATE_FULL_INCOMING;
    } else {
        apdu.state = STATE_PARTIAL_INCOMING;
    }
    return toBeProcessed;
}

function receiveBytes(apdu, bOffs){
    if(apdu.state < STATE_PARTIAL_INCOMING || apdu.state >= STATE_OUTGOING){
        return e.getAPDUException(6);//ILLEAGAL_USE
    }
    var toBeProcessed = Math.min(IN_BLOCKSIZE, apdu._buffer.length - apdu.offSetIncoming - apdu.leLength);
    for(var i = 0; i< toBeProcessed; i++){
        apdu.buffer[bOffs + i] = apdu._buffer[apdu.offSetIncoming + i];
    }
    apdu.offSetIncoming += toBeProcessed;
    if(apdu.offSetIncoming === (apdu._buffer.length - apdu.leLength)){
        apdu.state = STATE_FULL_INCOMING;
    } else {
        apdu.state = STATE_PARTIAL_INCOMING;
    }
    return toBeProcessed;
}

function setOutgoing(apdu){
    if(apdu.state >= STATE_OUTGOING){
        return e.getAPDUException(6);//ILLEAGAL_USE
    }
    apdu.state = STATE_OUTGOING;
    var outgoingLength = getOutgoingLength(apdu);
    apdu.currentOutgoingLength = 0;
    apdu.outgoingLength = outgoingLength;
    return outgoingLength;
}

function setOutgoingNoChaining() {
    return;
}

function setOutgoingLength(apdu, length){
    if(apdu.state < STATE_OUTGOING){
        return e.getAPDUException(6);//ILLEAGAL_USE
    }
    if(length !== null && length > apdu.Ne){
        return e.getAPDUException(3);//BAD_LENGTH
    }
    apdu.state = STATE_OUTGOING_LENGTH_KNOWN;
    apdu.currentOutgoingLength = 0;
    apdu.outGoingLength = length;
}

function sendBytes(apdu, bOffs, length){
    if(apdu.state < STATE_OUTGOING){
        return e.getAPDUException(6);//ILLEAGAL_USE
    }
    if(apdu.currentOutgoingLength + length > OUT_BLOCKSIZE){
        return e.getAPDUException(2);//BUFFER_BOUNDS
    }
    for(var i = bOffs; i < bOffs + length; i++){
        apdu._buffer[apdu.currentOutgoingLength + i] = apdu.buffer[bOffs + i];
    }
    apdu.currentOutgoingLength += length;
    if (apdu.currentOutgoingLength < apdu.outGoingLength){
        apdu.state = STATE_PARTIAL_OUTGOING;
    } else{
        apdu.state = STATE_FULL_OUTGOING;
    }
}
function sendBytesLong(apdu, outData, bOffs, length){
    if(STATE_PARTIAL_OUTGOING < apdu.state && apdu.state < STATE_OUTGOING_LENGTH_KNOWN){
        return e.getAPDUException(6);//ILLEAGAL_USE
    }
    if(apdu.currentOutgoingLength + length > OUT_BLOCKSIZE){
        return e.getAPDUException(2);//BUFFER_BOUNDS
    }
    for(var i = bOffs; i < bOffs + length; i++){
        apdu._buffer[apdu.currentOutgoingLength + i] = outData[bOffs + i];
    }
    apdu.currentOutgoingLength += length;
    if (apdu.currentOutgoingLength < apdu.outGoingLength){
        apdu.state = STATE_PARTIAL_OUTGOING;
    } else{
        apdu.state = STATE_FULL_OUTGOING;
    }
}

function setOutgoingAndSend(apdu, bOffs, length){
    setOutgoing(apdu);
    setOutgoingLength(apdu, length);
    sendBytes(apdu, bOffs, length);
}

function getCurrentState(apdu){
    return apdu.state;
}

//should be a method of smartcard
function getCurrentAPDU(APDU) {
    return this; 
}

function getCurrentAPDUBuffer(){

}

function getCLAChannel(apdu) {
    return apdu.buffer[ISO7816.get('OFFSET_CLA')] & 0x3;
}

function waitExtension() {
    return;
}

//apdu.isCommandChainingCLA(); //0C boolean
function isCommandChainingCLA(apdu) {
    if ((apdu._buffer[ISO7816.get('OFFSET_CLA')] & 0x10) === 0x00) {
        return 1;
    } else {
        return 0;
    }
}

function getOutgoingLength(apdu) {

    return apdu.Ne || 0;
}

function setOutgoing(apdu) { //07
    var outGoingLength;
    if (apdu.state >= STATE_OUTGOING) {
        return e.getAPDUException(6);//ILLEAGAL_USE
    }
    apdu.state = STATE_OUTGOING;
    outGoingLength = getOutgoingLength(apdu);
    apdu.currentOutgoingLength = 0;
    apdu.outgoingLength = outGoingLength;
    return outGoingLength;
}

function setOutgoingAndSend(apdu, bOff, len) {
    //apdu.setOutgoingAndSend(short, short);  //08
    setOutgoing(apdu);
    setOutgoingLength(apdu, len);
    sendBytes(apdu, bOff, len);

}

function setOutgoingNoChaining() {
    return 0;
}



function isSecureMessagingCLA(APDU) {
    var isType16CLA = (APDU.buffer[0] & 0x40) == 64;
    var smf;
    if (isType16CLA) {
        smf = (APDU.buffer[0] & 0x20);
    } else {
        smf = (APDU.buffer[0] & 0xc);
    }
    if(smf !== 0) {
        return 1;
    } else {
        return 0;
    }
}

function sISOInterindustryCLA(APDU) {
    if((APDU.buffer[0] & 0x80) === 0x00) {
        return 1;
    } else {
        return 0;
    }
}

/*function getIncomingLength(APDU) {
    return APDU.Nc;
}*/

function getOffsetCdata(APDU) {
    return apdu.currentDataOffset;
}

function getArrayLength(APDU, fieldno) { 
    if (fieldno == 1) { return APDU.buffer.length; } else { return 0;}
}