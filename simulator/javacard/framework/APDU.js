//Code mostly converted from pythoncard project https://bitbucket.org/benallard/pythoncard/
/*!
 * APDU
 *
 * Application Protocol Data Unit (APDU) is the communication format between
 * the card and the off-card applications. The format of the APDU is defined
 * in ISO specification 7816-4.

 * @author Adam Noakes
 * University of Southampton
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
    /**
     * Handles javacard.framework.APDU api calls.
     *
     * @param  {Number} method The method token
     * @param  {Number} type   The method type token
     * @param  {Array}  param  Popped from operand stack
     * @param  {APDU}   obj    The APDU object
     * @return                 Error or the result of called function.
     */
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
    /**
     * Called on new keyword and sets initial values.
     */
    APDU: function() {
        this.state = STATE_INITIAL;
        this.broken = false;
        this.type = 0;
        this.lc = 0;
        this.le = 0;
        this.leLength = 0;
        this.lcLength = 0;
        this.currentDataOffset = 0;
        this.buffer = [];
        this.P3len = 0;
        this.offSetIncoming = 4;
        this.currentOutgoingLength = 0;
    },
    /**
     * The processor uses this constructor to initialise an APDU
     * instance encapsulating the specified APDU bytes and setting up the
     * various variables.
     *
     * @param  {APDU}   apdu    The AID object
     * @param  {Array}  bArray  The byte array containing the APDU bytes
     */
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
            apdu.lc = 0;
            apdu.le = 0;
            apdu.leLength = 0;
        } else if(bArray.length ===5 ||
            (apdu._buffer[4] === 0 && bArray.length === 7)){
            apdu.type = 2;
            apdu.lc = 0;
            temp = getOutLengths(apdu, bArray.length);
            apdu.le = temp[0];
            apdu.leLength = temp[1];
        } else if(bArray.length === apdu._buffer[4] + 5 ||
            bArray.length === getInLengths(apdu)[0] + 5) {
            apdu.type = 3;
            temp = getInLengths(apdu);
            apdu.lc = temp[0];
            apdu.lcLength = temp[1];
            apdu.le = 0;
            apdu.leLength = 0;
            apdu.currentDataOffset += apdu.lcLength -1;
        } else {
            apdu.type = 4;
            temp = getInLengths(apdu);
            apdu.lc = temp[0];
            apdu.lcLength = temp[1];
            temp = getOutLengths(apdu, bArray.length);
            apdu.le = temp[0];
            apdu.leLength = temp[1];
            apdu.currentDataOffset += apdu.lcLength - 1;

            //if((4 + apdu.lcLength + apdu.leLength + apdu.lc) !== bArray.length){
            //    apdu.broken = false;
            //}

            apdu.outgoingLength = 0;
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
    getCurrentState: function(APDU) {
        return APDU.state;
    },
    getBuffer: getBuffer
};

/**
 * Private functions
 * @private;
 */

/**
 * Handles object javacard.framework.APDU api calls.
 *
 * @param  {Number} method The method token
 * @param  {Array}  param  Popped from operand stack
 * @param  {AID}    obj    The APDU object
 * @return                 Error or the result of called function.
 */

function runObjectMethod(method, param, obj){
    switch(method){
        case 0://void
            return constr(obj, param[0]);
            //objectheap.push(new APDU(param[0]));
        case 1://normal
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

/**
 * Handles static javacard.framework.APDU api calls.
 *
 * @param  {Number} method The method token
 * @param  {Array}  param  Popped from operand stack
 * @param  {AID}    obj    The APDU object
 * @return                 Error or the result of called function.
 */

function runStaticMethod(method, param, obj){
    switch (method) {
        case 0:
            return getInBlockSize();
        case 1:
            return getOutBlockSize();
        case 2:
            return getProtocol();
        case 3:
            return waitExtension();
        case 4:
            return getCurrentAPDU();
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

/**
 * Returns the APDU buffer byte array.
 *
 * @param  {APDU} apdu The APDU object.
 * @return {Array}     APDU buffer byte Array.
 */
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

/**
 * Object methods
 */

/**
 * Ususally returns Node Address byte, we don't care,
 * this is a simulator.
 */
function getNAD(){
    return 1;
}

/**
 * This method is used to set the data transfer direction to outbound and to
 * obtain the expected length of response (le).
 *
 * @param {APDU} apdu The APDU object.
 */
function setOutgoing(apdu){
    if(apdu.state < 0){
        return e.getAPDUException(4);//IO_ERROR
    }
    if(apdu.state >= STATE_OUTGOING){
        return e.getAPDUException(1);//ILLEAGAL_USE
    }
    apdu.state = STATE_OUTGOING;
    var outgoingLength = apdu.le;
    apdu.currentOutgoingLength = 0;
    apdu.outgoingLength = outgoingLength;
    return outgoingLength;
}

function setOutgoingNoChaining() {
    return new Error("Method setOutgoingNoChaining not implemented for APDU.");
}

/**
 * Sets the actual length of response data. If a length of 0 is specified, no
 * data will be output.
 *
 * @param {APDU}   apdu   The APDU object.
 * @param {Number} length The length of response data
 */
function setOutgoingLength(apdu, length){
    if(apdu.state < 0){
        return e.getAPDUException(4);//IO_ERROR
    }
    if(apdu.state < STATE_OUTGOING){
        return e.getAPDUException(1);//ILLEAGAL_USE
    }
    if(length !== null && length > apdu.le){
        return e.getAPDUException(3);//BAD_LENGTH
    }
    apdu.state = STATE_OUTGOING_LENGTH_KNOWN;
    apdu.currentOutgoingLength = 0;
    apdu.outGoingLength = length;
}

/**
 * Gets as many data bytes as will fit without APDU buffer overflow, at the
 * specified offset bOff.
 *
 * @param  {APDU}   apdu  The APDU object.
 * @param  {Number} bOffs The offset into APDU buffer
 * @return {Number}       Number of bytes read.
 */
function receiveBytes(apdu, bOffs){
    if(apdu.state < 0){
        return e.getAPDUException(4);//IO_ERROR
    }
    if(bOffs < 0){
        return e.getAPDUException(2);//BUFFER_BOUNDS
    }
    if(apdu.state < STATE_PARTIAL_INCOMING || apdu.state >= STATE_OUTGOING){
        return e.getAPDUException(1);//ILLEAGAL_USE
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

/**
 * This is the primary receive method. Calling this method indicates that this
 * APDU has incoming data.
 *
 * @param {APDU} apdu The APDU object.
 * @return            Number of data bytes read.
 */
function setIncomingAndReceive(apdu){
    if(apdu.state < 0){
        return e.getAPDUException(4);//IO_ERROR
    }
    if (apdu.state !== STATE_INITIAL){
        return e.getAPDUException(1);//ILLEAGAL_USE
    }
    if (apdu.broken){
        return e.getISOException(ISO7816.get('SW_WRONG_LENGTH'));
    }

    var toBeProcessed = Math.min(IN_BLOCKSIZE,
        apdu._buffer.length - apdu.offSetIncoming - apdu.leLength);
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

/**
 * Sends length more bytes from APDU buffer at specified offset bOff.
 *
 * @param  {APDU}   apdu   The APDU object.
 * @param  {Number} bOffs  The offset into APDU buffer.
 * @param  {Number} length The length of the data in bytes to send.
 */
function sendBytes(apdu, bOffs, length){
    if(apdu.state < 0){
        return e.getAPDUException(4);//IO_ERROR
    }
    if(apdu.state < STATE_OUTGOING){
        return e.getAPDUException(1);//ILLEAGAL_USE
    }
    if(length < 0 || apdu.currentOutgoingLength + length > OUT_BLOCKSIZE){
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

/**
 * Sends length more bytes from outData byte array starting at specified
 * offset bOff.
 *
 * @param  {APDU}    apdu    The APDU object.
 * @param  {Array}   outData The source data byte array
 * @param  {Array}   bOffs   The offset into OutData array
 * @param  {Number} length  The byte length of the data to send
 */
function sendBytesLong(apdu, outData, bOffs, length){
    if(STATE_PARTIAL_OUTGOING < apdu.state &&
        apdu.state < STATE_OUTGOING_LENGTH_KNOWN){
        return e.getAPDUException(1);//ILLEAGAL_USE
    }
    if(length < 0 || apdu.currentOutgoingLength + length > OUT_BLOCKSIZE){
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

/**
 * This is the "convenience" send method. It provides for the most efficient
 * way to send a short response which fits in the buffer and needs the least
 * protocol overhead.
 *
 * @param {APDU}   apdu   The APDU object.
 * @param {Array}  bOffs  The offset into APDU buffer.
 * @param {Number} length The bytelength of the data to send.
 */
function setOutgoingAndSend(apdu, bOffs, length){
    var error;
    error = setOutgoing(apdu);
    if(error instanceof Error)
        return error;
    error = setOutgoingLength(apdu, length);
    if(error instanceof Error)
        return error;
    error = sendBytes(apdu, bOffs, length);
    if(error instanceof Error)
        return error;
}

/**
 * This method returns the current processing state of the APDU object.
 *
 * @param  {APDU} apdu The APDU Object.
 * @return {Number}    The current processing state of the APDU.
 */
function getCurrentState(apdu){
    return apdu.state;
}

/**
 * Static methods
 *
 * Minimal support for these functions.
 *
 * @static
 */

function getCurrentAPDU() {
    return 0; //simulator keeps APDU in objectheap 0
}

function getCurrentAPDUBuffer(){

}

function getCLAChannel(apdu) {
    return apdu.buffer[ISO7816.get('OFFSET_CLA')] & 0x3;
}

function waitExtension() {
    return;
}

/**
 * Object methods
 */

/**
 * Returns whether the current APDU command is the first or part of a
 * command chain.
 *
 * @param  {APDU}   apdu The APDU object.
 * @return {boolean}
 */
function isCommandChainingCLA(apdu) {
    if ((apdu._buffer[ISO7816.get('OFFSET_CLA')] & 0x10) === 0x00) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * Returns true if the encoding of the current APDU command based on the CLA
 * byte indicates secure messaging.
 *
 * @param  {APDU}    APDU The APDU
 * @return {boolean}
 */
function isSecureMessagingCLA(apdu) {
    var isType16CLA = (apdu._buffer[0] & 0x40) == 64;
    var smf;
    if (isType16CLA) {
        smf = (apdu._buffer[0] & 0x20);
    } else {
        smf = (APDU._buffer[0] & 0xc);
    }
    if(smf !== 0) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * Returns whether the current APDU command CLA byte corresponds to an
 * interindustry command as defined in ISO 7816-4:2013 specification.
 *
 * @param  {APDU}    APDU The APDU Object.
 * @return {boolean}
 */
function sISOInterindustryCLA(apdu) {
    if((apdu._buffer[0] & 0x80) === 0x00) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * Returns the incoming data length (Lc).
 *
 * @param  {APDU}    apdu The APDU object.
 * @return {Numbner}
 */
function getIncomingLength(apdu) {
    if(apdu.state !== STATE_PARTIAL_INCOMING ||
        apdu.state !== STATE_FULL_INCOMING)
        return e.getAPDUException(1);//ILLEAGL_USE
    return apdu.lc;
}

/**
 * Returns the offset within the APDU buffer for incoming command data.
 *
 * @param  {APDU}   APDU The APDU object
 * @return {[type]}      [description]
 */
function getOffsetCdata(APDU) {
    if(apdu.state !== STATE_PARTIAL_INCOMING ||
        apdu.state !== STATE_FULL_INCOMING)
        return e.getAPDUException(1);//ILLEAGL_USE
    return apdu.currentDataOffset;
}
