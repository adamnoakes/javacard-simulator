function CardException() {
    var res = 0;
    this.constr = function (reason) { res = reason; }

    CardException.throwIt = function (reason) {

        Recover.RecoverAll();
        gSW = "0x6F00";
        alert("CardException " + reason);

    }


    this.restore = function (pars) { res = pars[0]; }
    this.save = function () { return "f04/" + res; }
}

function CardRuntimeException() {
    var res = 0;
    this.constr = function(reason) {res = reason;}

    CardRuntimeException.throwIt = function (reason) {
        
        Recover.RecoverAll();
        gSW = "0x6F00";
        alert("CardRuntimeException " + reason);

    }


    this.restore = function (pars) { res = pars[0];}
    this.save = function () { return "f05/" + res; }
}

function PINException() {
    var res = 0;
    this.constr = function(reason) {res = reason;}
    PINException.ILLEGAL_VALUE = 0;

    PINException.throwIt = function(reason)
    {
        var msg;
        switch (reason) {
            case 1:
                msg = "ILLEGAL_VALUE"; break;
        }

        Recover.RecoverAll();
        gSW = "0x6F00";
        alert("PINException: " + msg);

    }
    this.restore = function (pars) { res = pars[0]; }
    this.save = function () { return "f0B/" + res; }
}

function SystemException() {
    var res = 0;
    this.constr = function(reason) {res = reason;}

    SystemException.ILLEGAL_VALUE = 1;
    SystemException.NO_TRANSIENT_SPACE = 2;
    SystemException.ILLEGAL_TRANSIENT = 3;
    SystemException.ILLEGAL_AID = 4;
    SystemException.NO_RESOURCE = 5;
    SystemException.ILLEGAL_USE = 6;

    SystemException.throwIt = function (reason)
    {
        var msg;

        switch(reason) {
            case 1:
                msg = "ILLEGAL_VALUE"; break;
            case 2:
                msg = "NO_TRANSIENT_SPACE"; break;
            case 3:
                msg = "ILLEGAL_TRANSIENT"; break;
            case 4:
                msg = "ILLEGAL_AID"; break;
            case 5:
                msg = "NO_RESOURCE"; break;
            case 6:
                msg = "ILLEGAL_USE"; break;
        }


        Recover.RecoverAll();
        gSW = "0x6F00";
        alert("SystemException: " + msg);
       
    }
    this.restore = function (pars) { res = pars[0]; }
    this.save = function () { return "f0D/" + res; }
}

function ISOException() {
    //07
    var res = 0;
    this.constr = function(reason) {res = reason;}
    ISOException.throwIt = function (reason) {

        gSW = "0x" + reason.toString(16);

        Recover.RecoverAll();
            //alert("ISOException: " + msg);

    }

    this.restore = function (pars) { res = pars[0]; }
    this.save = function () { return "f07/" + res; }

}


function APDUException() {
    var res = 0;
    this.constr = function(reason) {res = reason;}
    APDUException.ILLEGAL_USE = 1;
    APDUException.BUFFER_BOUNDS = 2;
    APDUException.BAD_LENGTH = 3;
    APDUException.IO_ERROR = 4;
    APDUException.NO_T0_GETRESPONSE = 170;
    APDUException.T1_IFD_ABORT = 171;
    APDUException.NO_T0_REISSUE = 172;

    APDUException.throwIt = function(reason)
    {

        var msg;
        switch (reason) {
            case 1:
                msg = "ILLEGAL_VALUE"; break;
            case 2:
                msg = "BUFFER_BOUNDS"; break;
            case 3:
                msg = "BAD_LENGTH"; break;
            case 4:
                msg = "IO_ERROR"; break;
            case 170:
                msg = "NO_T0_GETRESPONSE"; break;
            case 171:
                msg = "T1_IFD_ABORT"; break;
            case 172:
                msg = "NO_T0_REISSUE"; break;
        }
        if (reason != 3) { Recover.RecoverAll(); };
        gSW = "0x6F00";
        alert("APDUException: " + msg);
 

    }

    this.restore = function (pars) { res = pars[0]; }
    this.save = function () { return "f0C/" + res; }
}


function TransactionException() {
    var res = 0;
    this.constr = function (reason) { res = reason; }

    TransactionException.IN_PROGRESS = 1;
    TransactionException.NOT_IN_PROGRESS = 2;

    TransactionException.throwIt = function (reason) {
        var msg;

        switch (reason) {
            case 1: msg = "IN_PROGRESS"; break;
            case 2: msg = "NOT_IN_PROGRESS"; break;
            default: msg = ""; break;
        }

        Recover.RecoverAll();
        gSW = "0x6F00";
        alert("TransactionException " + msg);

    }

    this.restore = function (pars) { res = pars[0]; }
    this.save = function () { return "f0E/" + res; }
}

function UserException() {
    var res = 0;
    this.constr = function(reason) {res = reason;}
    UserException.throwIt = function (reason) {


        Recover.RecoverAll();
        gSW = "0x6F00";
        alert("TransactionException " + reason);

    }

    this.restore = function (pars) { res = pars[0]; }
    this.save = function () { return "f0F/" + res; }
}