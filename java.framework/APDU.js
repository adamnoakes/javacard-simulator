
//Code mostly converted from pythoncard project https://bitbucket.org/benallard/pythoncard/
var isojs = require('./ISO7816.js');
function APDU() {
    //Class Token - 0A
    this.cls = 10;

    APDU.IN_BLOCKSIZE = 0x80;
    APDU.OUT_BLOCKSIZE = 0x100;

    APDU.STATE_INITIAL = 0;
    APDU.STATE_PARTIAL_INCOMING = 1;
    APDU.STATE_FULL_INCOMING = 2; 
    APDU.STATE_OUTGOING = 3;
    APDU.STATE_OUTGOING_LENGTH_KNOWN = 4;
    APDU.STATE_PARTIAL_OUTGOING = 5;
    APDU.STATE_FULL_OUTGOING = 6;

    APDU.PROTOCOL_MEDIA_CONTACTLESS_TYPE_A = 0;
    APDU.PROTOCOL_MEDIA_CONTACTLESS_TYPE_B = 1;
    APDU.PROTOCOL_MEDIA_DEFAULT = 2;
    APDU.PROTOCOL_MEDIA_MASK = 3;
    APDU.PROTOCOL_MEDIA_USB = 4;
    APDU.PROTOCOL_T0 = 5;
    APDU.PROTOCOL_T1 = 6;
    APDU.PROTOCOL_TYPE_MASK = 7;
    APDU.STATE_ERROR_IO = -1;
    APDU.STATE_ERROR_NO_T0_GETRESPONSE = -2;
    APDU.STATE_ERROR_NO_T0_REISSUE = -3;
    APDU.STATE_ERROR_T1_IFD_ABORT = -4;

    var state = APDU.STATE_INITIAL;
    var broken = 0;
    var type = 0;
    var Nc = 0;
    var Ne = 0;
    var lelength = 0;
    var lclength = 0;
    var cdataoffs = 0;
    var buffer = [];
    var P3len = 0;
    var offsetincoming = 4;
    var curoutgoinglength = 0;
    
    var cdataoffs = isojs.ISO7816.OFFSET_CDATA;
    APDU.buffer = [];
   
        APDU.theAPDU = this;
    // determine the APDU type
        
       this.constr = function (bArray) {
           
           buffer = bArray;

           
            if (bArray.length < 4) { APDUException.throwIt(APDUException.BAD_LENGTH) }
            if (bArray.length > 4) { P3len = 1; }
            if ((bArray[isojs.ISO7816.OFFSET_LC] == 0) && (bArray.length > isojs.ISO7816.OFFSET_LC + 3)) { P3len = 3; }
            //for (var i = isojs.ISO7816.OFFSET_LC; i < isojs.ISO7816.OFFSET_LC + P3len; i++) { APDU.buffer[i] = bArray[i] }
            offsetincoming += P3len;

            if (bArray.length == 4) { type = 1; Nc = 0; Ne = 0; lelength = 0; }
            else if ((bArray.length == 5) || ((buffer[4] == 0) && (bArray.length == 6))) {
                type = 2; Nc = 0;
                var temp = getOutLengths(bArray.length);
                Ne = temp[0]; lelength = temp[1];
                
            } else if ((bArray.length == buffer[4] + 5) || (bArray.length == getInLengths()[0] + 5)) {
                type = 3;
                var temp = getInLengths(); Nc = temp[0]; lclength = temp[1];
                Ne = 0; lelength = 0; cdataoffs += lclength - 1;
            } else {
                //self.type = 4; //REMOVED BY ADAM
                if(bArray.length > 6) {
                    var temp = getInLengths(); Nc = temp[0]; lclength = temp[1];
                    temp = getOutLengths(bArray.length); Ne = temp[0]; lelength = temp[1];
                    cdataoffs += lclength - 1;
                    if (4 + lclength + lelength + Nc != bArray.length) { broken = 1; }
                }
            }
            outgoinglength = 0;
            //buffer.length = 128;
            
    }
    
    function getInLengths() {
        var temp = [];
       
        if (buffer[isojs.ISO7816.OFFSET_LC] == 0) { temp[0] = buffer[isojs.ISO7816.OFFSET_LC + 1] * 256 + buffer[isojs.ISO7816.OFFSET_LC + 2]; temp[1] = 3; return temp; }
        else {
            
            temp[0] = buffer[isojs.ISO7816.OFFSET_LC]; temp[1] = 1; return temp;
        }
    }

    function getOutLengths(length) {
        //""" return a tuple (value, length of value) """
        var temp = [];
        length -= 1
        if (buffer[length] == 0) {    //# Lc and Le must have the same format
            if (length != isojs.ISO7816.OFFSET_LC) {
                if (buffer[isojs.ISO7816.OFFSET_LC] == 0) {
                    if (buffer[length - 1] == 0) { temp[0] = 65536; temp[1] = 2; return temp; }
                }
            }
            temp[0] = 256; temp[1] = 1; return temp;
        } else {
            if (length != isojs.ISO7816.OFFSET_LC) {
                if (buffer[isojs.ISO7816.OFFSET_LC] == 0) { temp[0] = buffer[length - 1] * 256 + buffer[length]; temp[1] = 2; return temp; }
            }
            temp[0] = buffer[length]; temp[1] = 1; return temp;
        }
    }
    
    //STATIC METHODS
    //APDU.getInBlockSize() //00 short
    APDU.getInBlockSize = function () { return APDU.IN_BLOCKSIZE }

    //APDU.getOutBlockSize(); //01 short
    APDU.getOutBlockSize = function () { return APDU.OUT_BLOCKSIZE }

    //APDU.getProtocol(); //02 byte
    APDU.getProtocol = function () { return (APDU.PROTOCOL_MEDIA_DEFAULT << 4) | APDU.PROTOCOL_T1; }

    //APDU.waitExtension(); //03 void
    APDU.waitExtension = function () { return; }

    //APDU.getCurrentAPDU(); //04 APDU
    APDU.getCurrentAPDU = function () { return APDU.theAPDU; }

    //APDU.getCurrentAPDUBuffer(); //05 byte array
    APDU.getCurrentAPDUBuffer = function () { return APDU.theAPDU.getBuffer(); }

    //APDU.getCLAChannel(); //06 byte apduProtocol.getCLAChannel();
    APDU.getCLAChannel = function () { return APDU.theAPDU.getBuffer()[isojs.ISO7816.OFFSET_CLA] & 0x3; }

    APDU.getState = function () { return APDU.theAPDU.state;}

    //VIRTUAL METHODS
    //apdu.getBuffer();apduProtocol.getBuffer();  //01 BArray
    this.getBuffer = function () { return buffer; }
    

    //apdu.getNAD(); //02 Byte
    this.getNAD = function () { return 0; }

    //apdu.receiveBytes(byte); //03 short
    this.receiveBytes = function (bOff) {


        if ((state < APDU.STATE_PARTIAL_INCOMING) ||
        (state >= APDU.STATE_OUTGOING)) { APDUException.throwIt(APDUException.ILLEGAL_USE) }
        
        var byteReceived;
        if (APDU.IN_BLOCKSIZE < buffer.length - offsetincoming - LeLen) { byteReceived = APDU.IN_BLOCKSIZE; }
        else { byteReceived = buffer.length - offsetincoming - LeLen; }
        
        for (var j = 0; j < byteReceived; j++) { APDU.buffer[bOff + j] = buffer[offsetincoming + j]; }
        
        offsetincoming += byteReceived;
        if (offsetincoming == buffer.length - LeLen) {
            APDU.state = APDU.STATE_FULL_INCOMING;
        } else { APDU.state = APDU.STATE_PARTIAL_INCOMING; }
        
        return byteReceived;
    }

    //apdu.sendBytes(byte, short); //04
    this.sendBytes = function (bOffs, len) {
        
        if (APDU.state < APDU.STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE) }
        if (curoutgoinglength + len > APDU.OUT_BLOCKSIZE) { APDUException.throwIt(APDUException.BUFFER_BOUNDS) }

        for (var j = 0; j < len; j++) {
            APDU.buffer[curoutgoinglength + j] = buffer[bOffs + j];
        };

        curoutgoinglength += len;

        if (curoutgoinglength < outgoinglength) { state = APDU.STATE_PARTIAL_OUTGOING }
        else { state = APDU.STATE_FULL_OUTGOING };

    }

    this.sendBytesLong = function (outData, bOffs, len) {
        //apdu.sendBytesLong(bArray, byte, short); //05
        if ((APDU.STATE_PARTIAL_OUTGOING < state) && (state < APDU.STATE_OUTGOING_LENGTH_KNOWN)) {
            APDUException.throwIt(APDUException.ILLEGAL_USE);
        }
        if (curoutgoinglength + len > APDU.OUT_BLOCKSIZE) { APDUException.throwIt(APDUException.BUFFER_BOUNDS); }
        for (var j = 0; j < len; j++) { APDU.buffer[curoutgoinglength + j] = outData[bOffs + j]; }
        curoutgoinglength += len;
        if (curoutgoinglength < outgoinglength) { state = APDU.STATE_PARTIAL_OUTGOING; }
        else { state = APDU.STATE_FULL_OUTGOING }
    }

    this.setIncomingAndReceive = function () { //06
        if (state != APDU.STATE_INITIAL) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        if (broken==1) { ISOException.throwIt(isojs.ISO7816.SW_WRONG_LENGTH); }
        var tbp;
        if (APDU.IN_BLOCKSIZE < buffer.length - offsetincoming - lelength) { tbp = APDU.IN_BLOCKSIZE; } else { tbp = buffer.length - offsetincoming - lelength; };
        for (var j = 0; j < tbp; j++) { APDU.buffer[offsetincoming + j] = buffer[offsetincoming + j]; };
        offsetincoming += tbp;
        if (offsetincoming == (buffer.length - lelength)) { state = APDU.STATE_FULL_INCOMING; }
        else { state = APDU.STATE_PARTIAL_INCOMING; }
        return tbp;
    }

    this.getOutgoingLength = function () {

        return Ne;
    }

    this.setOutgoing = function () { //07
        if (state >= APDU.STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); };
        state = APDU.STATE_OUTGOING;
        var ogl = this.getOutgoingLength();
        curoutgoinglength = 0;
        outgoinglength = ogl;
        return ogl;
    }


    this.setOutgoingAndSend = function (bOff, len) {
        //apdu.setOutgoingAndSend(short, short);  //08
        this.setOutgoing();
        this.setOutgoingLength(len);
        this.sendBytes(bOff, len);

    }
    this.setOutgoingLength = function (len) {
        //apdu.setOutgoingLength(short); //09
        if (state < APDU.STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        if ((Ne != 0) && (len > Ne)) { APDUException.throwIt(APDUException.BAD_LENGTH); }
        state = APDU.STATE_OUTGOING_LENGTH_KNOWN;
        curoutgoinglength = 0;
        outgoinglength = len;
    }

    //apdu.setOutgoingNoChaining(); //0A short
    this.setOutgoingNoChaining = function () { return 0; }

    //apdu.getCurrentState(); //0B byte
    this.getCurrentState = function () { return state; }

    //apdu.isCommandChainingCLA(); //0C boolean
    this.isCommandChainingCLA = function () {

        if ((buffer[0] & 0x10) == 0x00) { return 1 } else { return 0 };
    }

    this.isSecureMessagingCLA = function () {
        //apdu.isSecureMessagingCLA(); //0D boolean
        var isType16CLA = (buffer[0] & 0x40) == 64;
        var smf;
        if (isType16CLA) {
            smf = (buffer[0] & 0x20);
        } else {
            smf = (buffer[0] & 0xc);
        }
        if(smf != 0) {return 1} else {return 0};
    }

    //apdu.isISOInterindustryCLA(); //0E boolean
    this.isISOInterindustryCLA = function () {
        if((buffer[0] & 0x80) == 0x00) {return 1} else {return 0};
    }


    this.getIncomingLength = function () {
        //apdu.getIncomingLength(); //0F short
        return Nc;
    }
    //this.getIncomingLength = getIncomingLength();

    this.getOffsetCdata = function () {
        //apdu.getOffsetCdata(); //10
        var s; 
        if (cdataoffs) { s = 7; } else { s = 5; };
        return s;
    }
    //this.getOffsetCdata = getOffsetCdata();



    this.restore = function (params) {

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

    }

    this.getArrayLength = function (fieldno) { 
        if (fieldno == 1) { return buffer.length; } else { return 0;}
    }

    this.save = function () {
        
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
    }

    this.setArray = function (arr, index, value) { if (arr == 1) { buffer[index] = value; } }
    this.getArray = function (arr, index) { if (arr == 1) { return buffer[index]; } }

}

exports.APDU = APDU;
