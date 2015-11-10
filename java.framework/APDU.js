
//Code mostly converted from pythoncard project https://bitbucket.org/benallard/pythoncard/
var ISO7816 = require('./ISO7816.js');
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
    APDU.theAPDU = this;//needs to be removed

    //STATIC METHODS
    //APDU.getInBlockSize() //00 short
    APDU.getInBlockSize = function () { return APDU.IN_BLOCKSIZE; };

    //APDU.getOutBlockSize(); //01 short
    APDU.getOutBlockSize = function () { return APDU.OUT_BLOCKSIZE; };

    //APDU.getProtocol(); //02 byte
    APDU.getProtocol = function () { return (APDU.PROTOCOL_MEDIA_DEFAULT << 4) | APDU.PROTOCOL_T1; };

    //APDU.waitExtension(); //03 void
    APDU.waitExtension = function () { return; };

    //APDU.getCurrentAPDU(); //04 APDU
    APDU.getCurrentAPDU = function () { return APDU.theAPDU; };

    //APDU.getCurrentAPDUBuffer(); //05 byte array
    // adam APDU.getCurrentAPDUBuffer = function () { return APDU.theAPDU.getBuffer(); };

    //APDU.getCLAChannel(); //06 byte apduProtocol.getCLAChannel();
    this.getCLAChannel = function () { return this.buffer[ISO7816.OFFSET_CLA] & 0x3; };//changed from APDU

    //adam APDU.getState = function () { return APDU.theAPDU.state;};

    this.cdataoffs = ISO7816.OFFSET_CDATA;
    this.state = APDU.STATE_INITIAL;
    this.broken = 0;
    this.type = 0;
    this.Nc = 0;
    this.Ne = 0;
    this.lelength = 0;
    this.lclength = 0;
    this.cdataoffs = 0;
    this.buffer = [];
    this.P3len = 0;
    this.offsetincoming = 4;
    this.curoutgoinglength = 0;
    this.outgoinglength = undefined; //check where this is defined in original file
    this.buffer = [];

    this.getBuffer = function(){
        return this.buffer;
    };
    this.constr = function (bArray) {
        this.buffer = bArray;
        var temp = undefined;
        if (bArray.length < 4) { APDUException.throwIt(APDUException.BAD_LENGTH); }
        if (bArray.length > 4) { this.P3len = 1; }
        if ((bArray[ISO7816.OFFSET_LC] === 0) && (bArray.length > ISO7816.OFFSET_LC + 3)) { this.P3len = 3; }
        //for (var i = ISO7816.OFFSET_LC; i < ISO7816.OFFSET_LC + P3len; i++) { APDU.buffer[i] = bArray[i] }
        this.offsetincoming += this.P3len;

        if (bArray.length == 4) { this.type = 1; this.Nc = 0; this.Ne = 0; this.lelength = 0; }
        else if ((bArray.length == 5) || ((this.buffer[4] === 0) && (bArray.length == 6))) {
            this.type = 2; this.Nc = 0;
            temp = getOutLengths(this.buffer, bArray.length);
            this.Ne = temp[0]; this.lelength = temp[1];

        } else if ((bArray.length == this.buffer[4] + 5) || (bArray.length == getInLengths(this.buffer)[0] + 5)) {
            this.type = 3;
            temp = getInLengths(this.buffer); this.Nc = temp[0]; this.lclength = temp[1];
            this.Ne = 0; this.lelength = 0; this.cdataoffs += this.lclength - 1;
        } else {
            //self.type = 4; //REMOVED BY ADAM
            if(bArray.length > 6) {
                temp = getInLengths(this.buffer); this.Nc = temp[0]; this.lclength = temp[1];
                temp = getOutLengths(this.buffer, bArray.length); this.Ne = temp[0]; this.lelength = temp[1];
                this.cdataoffs += this.lclength - 1;
                if (4 + this.lclength + this.lelength + this.Nc != bArray.length) { this.broken = 1; }
            }
        }
        this.outgoinglength = 0;
        //buffer.length = 128;

    };
    
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
    


    //VIRTUAL METHODS
    //apdu.getBuffer();apduProtocol.getBuffer();  //01 BArray
    this.getBuffer = function () { return this.buffer; };
    

    //apdu.getNAD(); //02 Byte
    this.getNAD = function () { return 0; };

    //apdu.receiveBytes(byte); //03 short
    this.receiveBytes = function (bOff) {
        if ((this.state < APDU.STATE_PARTIAL_INCOMING) ||
        (this.state >= APDU.STATE_OUTGOING)) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        
        var byteReceived;
        if (APDU.IN_BLOCKSIZE < this.buffer.length - this.offsetincoming - this.lelength) { byteReceived = APDU.IN_BLOCKSIZE; }
        else { byteReceived = this.buffer.length - this.offsetincoming - this.lelength; }
        
        for (var j = 0; j < byteReceived; j++) { this.buffer[bOff + j] = this.buffer[this.offsetincoming + j]; }
        
        this.offsetincoming += byteReceived;
        if (this.offsetincoming == this.buffer.length - this.lelength) {
            this.state = APDU.STATE_FULL_INCOMING;
        } else { this.state = APDU.STATE_PARTIAL_INCOMING; }
        
        return byteReceived;
    };

    //apdu.sendBytes(byte, short); //04
    this.sendBytes = function (bOffs, len) {
        
        if (this.state < APDU.STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        if (this.curoutgoinglength + len > APDU.OUT_BLOCKSIZE) { APDUException.throwIt(APDUException.BUFFER_BOUNDS); }

        for (var j = 0; j < len; j++) {
            this.buffer[this.curoutgoinglength + j] = this.buffer[bOffs + j];
        }

        this.curoutgoinglength += len;

        if (this.curoutgoinglength < this.outgoinglength) { this.state = APDU.STATE_PARTIAL_OUTGOING; }
        else { this.state = APDU.STATE_FULL_OUTGOING; }

    };

    this.sendBytesLong = function (outData, bOffs, len) {
        //apdu.sendBytesLong(bArray, byte, short); //05
        if ((APDU.STATE_PARTIAL_OUTGOING < this.state) && (this.state < APDU.STATE_OUTGOING_LENGTH_KNOWN)) {
            APDUException.throwIt(APDUException.ILLEGAL_USE);
        }
        if (this.curoutgoinglength + len > APDU.OUT_BLOCKSIZE) { APDUException.throwIt(APDUException.BUFFER_BOUNDS); }
        for (var j = 0; j < len; j++) { this.buffer[this.curoutgoinglength + j] = outData[bOffs + j]; }
        this.curoutgoinglength += len;
        if (this.curoutgoinglength < this.outgoinglength) { this.state = APDU.STATE_PARTIAL_OUTGOING; }
        else { this.state = APDU.STATE_FULL_OUTGOING; }
    };

    this.setIncomingAndReceive = function () { //06
        if (this.state != APDU.STATE_INITIAL) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        if (this.broken==1) { ISOException.throwIt(ISO7816.SW_WRONG_LENGTH); }
        var tbp;
        if (APDU.IN_BLOCKSIZE < this.buffer.length - this.offsetincoming - this.lelength) { tbp = APDU.IN_BLOCKSIZE; } else { tbp = this.buffer.length - this.offsetincoming - this.lelength; }
        for (var j = 0; j < tbp; j++) { this.buffer[this.offsetincoming + j] = this.buffer[this.offsetincoming + j]; }
        this.offsetincoming += tbp;
        if (this.offsetincoming == (this.buffer.length - this.lelength)) { this.state = APDU.STATE_FULL_INCOMING; }
        else { this.state = APDU.STATE_PARTIAL_INCOMING; }
        return tbp;
    };

    this.getOutgoingLength = function () {

        return this.Ne;
    };

    this.setOutgoing = function () { //07
        if (this.state >= APDU.STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        this.state = APDU.STATE_OUTGOING;
        var ogl = this.getOutgoingLength();
        this.curoutgoinglength = 0;
        this.outgoinglength = ogl;
        return ogl;
    };


    this.setOutgoingAndSend = function (bOff, len) {
        //apdu.setOutgoingAndSend(short, short);  //08
        this.setOutgoing();
        this.setOutgoingLength(len);
        this.sendBytes(bOff, len);

    };
    this.setOutgoingLength = function (len) {
        //apdu.setOutgoingLength(short); //09
        if (this.state < APDU.STATE_OUTGOING) { APDUException.throwIt(APDUException.ILLEGAL_USE); }
        if ((this.Ne !== 0) && (len > this.Ne)) { APDUException.throwIt(APDUException.BAD_LENGTH); }
        this.state = APDU.STATE_OUTGOING_LENGTH_KNOWN;
        this.curoutgoinglength = 0;
        this.outgoinglength = len;
    };

    //apdu.setOutgoingNoChaining(); //0A short
    this.setOutgoingNoChaining = function () { return 0; };

    //apdu.getCurrentState(); //0B byte
    this.getCurrentState = function () { return this.state; };

    //apdu.isCommandChainingCLA(); //0C boolean
    this.isCommandChainingCLA = function () {

        if ((this.buffer[0] & 0x10) === 0x00) { return 1; } else { return 0; }
    };

    this.isSecureMessagingCLA = function () {
        //apdu.isSecureMessagingCLA(); //0D boolean
        var isType16CLA = (this.buffer[0] & 0x40) == 64;
        var smf;
        if (isType16CLA) {
            smf = (this.buffer[0] & 0x20);
        } else {
            smf = (this.buffer[0] & 0xc);
        }
        if(smf !== 0) {return 1;} else {return 0;}
    };

    //apdu.isISOInterindustryCLA(); //0E boolean
    this.isISOInterindustryCLA = function () {
        if((this.buffer[0] & 0x80) === 0x00) {return 1;} else {return 0;}
    };


    this.getIncomingLength = function () {
        //apdu.getIncomingLength(); //0F short
        return this.Nc;
    };
    //this.getIncomingLength = getIncomingLength();

    this.getOffsetCdata = function () {
        //apdu.getOffsetCdata(); //10
        var s; 
        if (this.cdataoffs) { s = 7; } else { s = 5; }
        return s;
    };
    //this.getOffsetCdata = getOffsetCdata();


    //removed by adam
    /*this.restore = function (params) {

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

    this.getArrayLength = function (fieldno) { 
        if (fieldno == 1) { return this.buffer.length; } else { return 0;}
    };

    //remove by adam
    /*this.save = function () {
        
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

    this.setArray = function (arr, index, value) { if (arr == 1) { this.buffer[index] = value; } };
    this.getArray = function (arr, index) { if (arr == 1) { return this.buffer[index]; } };

}

exports.APDU = APDU;
