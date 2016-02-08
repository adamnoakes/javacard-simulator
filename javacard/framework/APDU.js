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

    },
    run: function(method, type, param, obj, objref){
        switch (type) {
            case 3://object methods
                return runObjectMethod(method, param, obj, objref);
            case 6://static methods
                return runStaticMethod(method, param, obj, objref);
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
    constr: function(APDU, bArray) {
        APDU.buffer = bArray;
        var temp;
        if (bArray.length < 4) { APDUException.throwIt(APDUException.BAD_LENGTH); }
        if (bArray.length > 4) { APDU.P3len = 1; }
        if ((bArray[ISO7816.OFFSET_LC] === 0) && (bArray.length > ISO7816.OFFSET_LC + 3)) { APDU.P3len = 3; }
        //for (var i = ISO7816.OFFSET_LC; i < ISO7816.OFFSET_LC + P3len; i++) { APDU.buffer[i] = bArray[i] }
        APDU.offsetincoming += APDU.P3len;

        if (bArray.length == 4) { APDU.type = 1; APDU.Nc = 0; APDU.Ne = 0; APDU.lelength = 0; }
        else if ((bArray.length == 5) || ((APDU.buffer[4] === 0) && (bArray.length == 6))) {
            APDU.type = 2; APDU.Nc = 0;
            temp = getOutLengths(APDU.buffer, bArray.length);
            APDU.Ne = temp[0]; APDU.lelength = temp[1];

        } else if ((bArray.length == APDU.buffer[4] + 5) || (bArray.length == getInLengths(APDU.buffer)[0] + 5)) {
            APDU.type = 3;
            temp = getInLengths(APDU.buffer); APDU.Nc = temp[0]; APDU.lclength = temp[1];
            APDU.Ne = 0; APDU.lelength = 0; APDU.cdataoffs += APDU.lclength - 1;
        } else {
            //self.type = 4; //REMOVED BY ADAM
            if(bArray.length > 6) {
                temp = getInLengths(APDU.buffer); APDU.Nc = temp[0]; APDU.lclength = temp[1];
                temp = getOutLengths(APDU.buffer, bArray.length); APDU.Ne = temp[0]; APDU.lelength = temp[1];
                APDU.cdataoffs += APDU.lclength - 1;
                if (4 + APDU.lclength + APDU.lelength + APDU.Nc != bArray.length) { APDU.broken = 1; }
            }
        }
        APDU.outgoinglength = 0;
        //buffer.length = 128;

    },
    getCurrentState: function(APDU) {
        return APDU.state;
    },
    getBuffer: getBuffer,
};

/**
 * Private functions
 * @private;
 */

function runObjectMethod(method, param, obj, objref){
    switch(method){
        case 0://void
            return constr(obj, param[0]);
            //objectheap.push(new APDU(param[0]));
        case 1://normal
            //retval = obj.getBuffer();
            //instead returns the memorylocation of buffer.
            return "H" + objref + "#" + 1 + "#" + getArrayLength(obj, 1);
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

function runStaticMethod(method, param, obj, objref){
    switch (method) {
        case 0:
            return getInBlockSize(obj);
        case 1:
            return getOutBlockSize(obj);
        case 2:
            return getProtocol(obj);
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

function waitExtension() {
    return;
}

function getCurrentAPDU(APDU) {
    return this; 
}

function getCLAChannel(APDU) {
    return APDU.buffer[ISO7816.OFFSET_CLA] & 0x3;
}

/**
 * Virtual methods
 */

function getBuffer(APDU) {
    return APDU.buffer;
}



function getInLengths(buffer) {
    var temp = [];
   
    if (buffer[ISO7816.OFFSET_LC] === 0) { temp[0] = buffer[ISO7816.OFFSET_LC + 1] * 256 + buffer[ISO7816.OFFSET_LC + 2]; temp[1] = 3; return temp; }
    else {
        
        temp[0] = buffer[ISO7816.OFFSET_LC]; temp[1] = 1; return temp;
    }
}

function getOutLengths(buffer, length) {
    //""" return a tuple (value, length of value) """
    var temp = [];
    length -= 1;
    if (buffer[length] === 0) {    //# Lc and Le must have the same format
        if (length != ISO7816.OFFSET_LC) {
            if (buffer[ISO7816.OFFSET_LC] === 0) {
                if (buffer[length - 1] === 0) { temp[0] = 65536; temp[1] = 2; return temp; }
            }
        }
        temp[0] = 256; temp[1] = 1; return temp;
    } else {
        if (length != ISO7816.OFFSET_LC) {
            if (buffer[ISO7816.OFFSET_LC] === 0) { temp[0] = buffer[length - 1] * 256 + buffer[length]; temp[1] = 2; return temp; }
        }
        temp[0] = buffer[length]; temp[1] = 1; return temp;
    }
}

function getNAD(){
    return 0;
}

function receiveBytes(APDU, bOff) {
    if ((APDU.state < STATE_PARTIAL_INCOMING) ||
    (APDU.state >= STATE_OUTGOING)) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
    
    var byteReceived;
    if (IN_BLOCKSIZE < APDU.buffer.length - APDU.offsetincoming - APDU.lelength) { byteReceived = IN_BLOCKSIZE; }
    else { byteReceived = APDU.buffer.length - APDU.offsetincoming - APDU.lelength; }
    
    for (var j = 0; j < byteReceived; j++) { APDU.buffer[bOff + j] = APDU.buffer[APDU.offsetincoming + j]; }
    
    APDU.offsetincoming += byteReceived;
    if (APDU.offsetincoming == APDU.buffer.length - APDU.lelength) {
        APDU.state = STATE_FULL_INCOMING;
    } else { APDU.state = STATE_PARTIAL_INCOMING; }
    
    return byteReceived;
}

function sendBytes(APDU, bOffs, len) {
    
    if (APDU.state < STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
    if (APDU.curoutgoinglength + len > OUT_BLOCKSIZE) { APDUException.throwIt(APDUException.BUFFER_BOUNDS); }

    for (var j = 0; j < len; j++) {
        APDU.buffer[APDU.curoutgoinglength + j] = APDU.buffer[bOffs + j];
    }

    APDU.curoutgoinglength += len;

    if (APDU.curoutgoinglength < APDU.outgoinglength) { APDU.state = STATE_PARTIAL_OUTGOING; }
    else { APDU.state = STATE_FULL_OUTGOING; }

}

function sendBytesLong(APDU, outData, bOffs, len) {
    //apdu.sendBytesLong(bArray, byte, short); //05
    if ((STATE_PARTIAL_OUTGOING < APDU.state) && (APDU.state < STATE_OUTGOING_LENGTH_KNOWN)) {
        APDUException.throwIt(APDUException.ILLEGAL_USE);
    }
    if (APDU.curoutgoinglength + len > OUT_BLOCKSIZE) { APDUException.throwIt(APDUException.BUFFER_BOUNDS); }
    for (var j = 0; j < len; j++) { APDU.buffer[APDU.curoutgoinglength + j] = outData[bOffs + j]; }
    APDU.curoutgoinglength += len;
    if (APDU.curoutgoinglength < APDU.outgoinglength) { APDU.state = STATE_PARTIAL_OUTGOING; }
    else { APDU.state = STATE_FULL_OUTGOING; }
}

function setIncomingAndReceive(APDU) { //06
    if (APDU.state != STATE_INITIAL) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
    if (APDU.broken==1) { ISOException.throwIt(ISO7816.SW_WRONG_LENGTH); }
    var tbp;
    if (IN_BLOCKSIZE < APDU.buffer.length - APDU.offsetincoming - APDU.lelength) { tbp = IN_BLOCKSIZE; } else { tbp = APDU.buffer.length - APDU.offsetincoming - APDU.lelength; }
    for (var j = 0; j < tbp; j++) { APDU.buffer[APDU.offsetincoming + j] = APDU.buffer[APDU.offsetincoming + j]; }
    APDU.offsetincoming += tbp;
    if (APDU.offsetincoming == (APDU.buffer.length - APDU.lelength)) { APDU.state = STATE_FULL_INCOMING; }
    else { APDU.state = STATE_PARTIAL_INCOMING; }
    return tbp;
}

function getOutgoingLength(APDU) {

    return APDU.Ne;
}

function setOutgoing(APDU) { //07
    if (APDU.state >= STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
    APDU.state = STATE_OUTGOING;
    var ogl = getOutgoingLength(APDU);
    APDU.curoutgoinglength = 0;
    APDU.outgoinglength = ogl;
    return ogl;
}

function setOutgoingAndSend(APDU, bOff, len) {
    //apdu.setOutgoingAndSend(short, short);  //08
    setOutgoing(APDU);
    setOutgoingLength(APDU, len);
    sendBytes(APDU, bOff, len);

}

function setOutgoingLength(APDU, len) {
    //apdu.setOutgoingLength(short); //09
    if (APDU.state < STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
    if ((APDU.Ne !== 0) && (len > APDU.Ne)) { APDUException.throwIt(APDUException.BAD_LENGTH); }
    APDU.state = STATE_OUTGOING_LENGTH_KNOWN;
    APDU.curoutgoinglength = 0;
    APDU.outgoinglength = len;
}

function setOutgoingNoChaining() {
    return 0;
}

//apdu.isCommandChainingCLA(); //0C boolean
function isCommandChainingCLA(APDU) {
    if ((APDU.buffer[0] & 0x10) === 0x00) {
        return 1;
    } else {
        return 0;
    }
}

function isSecureMessagingCLA(APDU) {
    //apdu.isSecureMessagingCLA(); //0D boolean
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

function getIncomingLength(APDU) {
    return APDU.Nc;
}

function getOffsetCdata(APDU) {
    //apdu.getOffsetCdata(); //10
    var s; 
    if (APDU.cdataoffs) { s = 7; } else { s = 5; }
    return s;
}

function getArrayLength(APDU, fieldno) { 
    if (fieldno == 1) { return APDU.buffer.length; } else { return 0;}
}