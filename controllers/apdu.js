modules.exports = {

	//STATIC METHODS
    //APDU.getInBlockSize() //00 short
    getInBlockSize: function (APDU) { return APDU.IN_BLOCKSIZE; },

    //APDU.getOutBlockSize(); //01 short
    getOutBlockSize: function (APDU) { return APDU.OUT_BLOCKSIZE; },

    //APDU.getProtocol(); //02 byte
    getProtocol: function (APDU) { return (APDU.PROTOCOL_MEDIA_DEFAULT << 4) | APDU.PROTOCOL_T1; },

    //APDU.waitExtension(); //03 void
    waitExtension: function (APDU) { return; },

    //APDU.getCurrentAPDU(); //04 APDU
    getCurrentAPDU: function (APDU) { return APDU.theAPDU; },

    //APDU.getCurrentAPDUBuffer(); //05 byte array
    // adam APDU.getCurrentAPDUBuffer = function () { return APDU.theAPDU.getBuffer(); };

    //APDU.getCLAChannel(); //06 byte apduProtocol.getCLAChannel();
    getCLAChannel: function (APDU) { return APDU.buffer[ISO7816.OFFSET_CLA] & 0x3; },//changed from APDU

        //adam APDU.getState = function () { return APDU.theAPDU.state;};

    //VIRTUAL METHODS
    //apdu.getBuffer();apduProtocol.getBuffer();  //01 BArray
    getBuffer: function (APDU) { return APDU.buffer; },


    constr: function (APDU, bArray) {
        APDU.buffer = bArray;
        var temp = undefined;
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
    
    getInLengths: function(buffer) {
        var temp = [];
       
        if (buffer[ISO7816.OFFSET_LC] === 0) { temp[0] = buffer[ISO7816.OFFSET_LC + 1] * 256 + buffer[ISO7816.OFFSET_LC + 2]; temp[1] = 3; return temp; }
        else {
            
            temp[0] = buffer[ISO7816.OFFSET_LC]; temp[1] = 1; return temp;
        }
    },

    getOutLengths: function(buffer, length) {
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
    },
    
    //apdu.getNAD(); //02 Byte
    getNAD: function (){ return 0; },

    //apdu.receiveBytes(byte); //03 short
    receiveBytes: function (APDU, bOff) {
        if ((APDU.state < APDU.STATE_PARTIAL_INCOMING) ||
        (APDU.state >= APDU.STATE_OUTGOING)) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        
        var byteReceived;
        if (APDU.IN_BLOCKSIZE < APDU.buffer.length - APDU.offsetincoming - APDU.lelength) { byteReceived = APDU.IN_BLOCKSIZE; }
        else { byteReceived = APDU.buffer.length - APDU.offsetincoming - APDU.lelength; }
        
        for (var j = 0; j < byteReceived; j++) { APDU.buffer[bOff + j] = APDU.buffer[APDU.offsetincoming + j]; }
        
        APDU.offsetincoming += byteReceived;
        if (APDU.offsetincoming == APDU.buffer.length - APDU.lelength) {
            APDU.state = APDU.STATE_FULL_INCOMING;
        } else { APDU.state = APDU.STATE_PARTIAL_INCOMING; }
        
        return byteReceived;
    },

    //apdu.sendBytes(byte, short); //04
    sendBytes: function(APDU, bOffs, len) {
        
        if (APDU.state < APDU.STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        if (APDU.curoutgoinglength + len > APDU.OUT_BLOCKSIZE) { APDUException.throwIt(APDUException.BUFFER_BOUNDS); }

        for (var j = 0; j < len; j++) {
            APDU.buffer[APDU.curoutgoinglength + j] = APDU.buffer[bOffs + j];
        }

        APDU.curoutgoinglength += len;

        if (APDU.curoutgoinglength < APDU.outgoinglength) { APDU.state = APDU.STATE_PARTIAL_OUTGOING; }
        else { APDU.state = APDU.STATE_FULL_OUTGOING; }

    },

    sendBytesLong: function (APDU, outData, bOffs, len) {
        //apdu.sendBytesLong(bArray, byte, short); //05
        if ((APDU.STATE_PARTIAL_OUTGOING < APDU.state) && (APDU.state < APDU.STATE_OUTGOING_LENGTH_KNOWN)) {
            APDUException.throwIt(APDUException.ILLEGAL_USE);
        }
        if (APDU.curoutgoinglength + len > APDU.OUT_BLOCKSIZE) { APDUException.throwIt(APDUException.BUFFER_BOUNDS); }
        for (var j = 0; j < len; j++) { APDU.buffer[APDU.curoutgoinglength + j] = outData[bOffs + j]; }
        APDU.curoutgoinglength += len;
        if (APDU.curoutgoinglength < APDU.outgoinglength) { APDU.state = APDU.STATE_PARTIAL_OUTGOING; }
        else { APDU.state = APDU.STATE_FULL_OUTGOING; }
    },

    setIncomingAndReceive: function (APDU) { //06
        if (APDU.state != APDU.STATE_INITIAL) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        if (APDU.broken==1) { ISOException.throwIt(ISO7816.SW_WRONG_LENGTH); }
        var tbp;
        if (APDU.IN_BLOCKSIZE < APDU.buffer.length - APDU.offsetincoming - APDU.lelength) { tbp = APDU.IN_BLOCKSIZE; } else { tbp = APDU.buffer.length - APDU.offsetincoming - APDU.lelength; }
        for (var j = 0; j < tbp; j++) { APDU.buffer[APDU.offsetincoming + j] = APDU.buffer[APDU.offsetincoming + j]; }
        APDU.offsetincoming += tbp;
        if (APDU.offsetincoming == (APDU.buffer.length - APDU.lelength)) { APDU.state = APDU.STATE_FULL_INCOMING; }
        else { APDU.state = APDU.STATE_PARTIAL_INCOMING; }
        return tbp;
    },

    getOutgoingLength: function (APDU) {

        return APDU.Ne;
    },

    setOutgoing: function (APDU) { //07
        if (APDU.state >= APDU.STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        APDU.state = APDU.STATE_OUTGOING;
        var ogl = APDU.getOutgoingLength();
        APDU.curoutgoinglength = 0;
        APDU.outgoinglength = ogl;
        return ogl;
    },

    setOutgoingAndSend: function (APDU, bOff, len) {
        //apdu.setOutgoingAndSend(short, short);  //08
        APDU.setOutgoing();
        APDU.setOutgoingLength(len);
        APDU.sendBytes(bOff, len);

    },

    setOutgoingLength: function (APDU, len) {
        //apdu.setOutgoingLength(short); //09
        if (APDU.state < APDU.STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        if ((APDU.Ne !== 0) && (len > APDU.Ne)) { APDUException.throwIt(APDUException.BAD_LENGTH); }
        APDU.state = APDU.STATE_OUTGOING_LENGTH_KNOWN;
        APDU.curoutgoinglength = 0;
        APDU.outgoinglength = len;
    },

    //apdu.setOutgoingNoChaining(); //0A short
    setOutgoingNoChaining: function () { return 0; },

    //apdu.getCurrentState(); //0B byte
    getCurrentState: function (APDU) { return APDU.state; },

    //apdu.isCommandChainingCLA(); //0C boolean
    isCommandChainingCLA: function (APDU) {
        if ((APDU.buffer[0] & 0x10) === 0x00) { return 1; } else { return 0; }
    },

    isSecureMessagingCLA: function (APDU) {
        //apdu.isSecureMessagingCLA(); //0D boolean
        var isType16CLA = (APDU.buffer[0] & 0x40) == 64;
        var smf;
        if (isType16CLA) {
            smf = (APDU.buffer[0] & 0x20);
        } else {
            smf = (APDU.buffer[0] & 0xc);
        }
        if(smf !== 0) {return 1;} else {return 0;}
    },

    //apdu.isISOInterindustryCLA(); //0E boolean
    isISOInterindustryCLA: function (APDU) {
        if((APDU.buffer[0] & 0x80) === 0x00) {return 1;} else {return 0;}
    },


    getIncomingLength: function (APDU) {
        //apdu.getIncomingLength(); //0F short
        return APDU.Nc;
    },
    //APDU.getIncomingLength = getIncomingLength();

    getOffsetCdata: function (APDU) {
        //apdu.getOffsetCdata(); //10
        var s; 
        if (APDU.cdataoffs) { s = 7; } else { s = 5; }
        return s;
    },
    //APDU.getOffsetCdata = getOffsetCdata();


    //removed by adam
    /*APDU.restore = function (params) {

        buffer = params[0];
        P3len = params[1];
        offsetincoming = params[2];
        state = params[3];
        broken = params[4];
        type = params[5];
        Nc = params[6];
        Ne = params[7];
        lelength = params[8];
        lclength = params[9];
        cdataoffs = params[10];
        curoutgoinglength = params[11];

    }*/

    getArrayLength: function (APDU, fieldno) { 
        if (fieldno == 1) { return APDU.buffer.length; } else { return 0;}
    },

    //remove by adam
    /*APDU.save = function () {
        
        var str = "f0A/" + buffer + "/" +
        P3len + "/" +
        offsetincoming + "/" +
        state + "/" +
        broken + "/" +
        type + "/" +
        Nc + "/" +
        Ne + "/" +
        lelength + "/" +
        lclength + "/" +
        cdataoffs + "/" +
        curoutgoinglength;
        
        return str;
    }*/

    setArray: function (APDU, arr, index, value) { if (arr == 1) { APDU.buffer[index] = value; } },
    getArray: function (APDU, arr, index) { if (arr == 1) { return APDU.buffer[index]; } }
}