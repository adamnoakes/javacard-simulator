
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

}

exports.APDU = APDU;
