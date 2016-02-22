var mnemonics = require('./mnemonics.js');

module.exports = {
	arraysEqual: function(a, b) {
		if (a === b) return true;
		if (a == null || b == null) return false;
		if (a.length != b.length) return false;

		// If you don't care about the order of the elements inside
		// the array, you should sort both arrays here.

		for (var i = 0; i < a.length; ++i) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	},
	addX: function(d){
		return "0x" + d;
	},
	addpad: function(d) {
	    var hex = Number(d).toString(16);

	    while (hex.length < 2) {
	        hex = "0" + hex;
	    }

	    return hex; //"0x" +
	},
	pad: function(val) {
        var rval;
        if (val.length == 1) {
            rval = "0" + val;
        } else { rval= val; }

        return rval;
    },


    numberToByte: function(val) {
        //convert byte code value to signed byte
        val = val % 256;

        if ((val >= 0) && (val < 128)) {
            return val;
        } else {
            return (val - 256);
        }
    },

    byteToShort: function(val) {
        //Sign extends a byte to short
        if (val >= 0 && val < (mnemonics.byte_s/2)) {
            return val;
        } else {
            val = mnemonics.byte_s - val;
            return (mnemonics.short_s - val);
        }
    },
    //TODO -> lowercase these functions
    byteToInt: function(val) {
        //Sign extends a byte to int
        if (val >= 0 && val < (mnemonics.byte_s / 2)) {
            return val;
        } else {
            val = mnemonics.byte_s - val;
            return (mnemonics.int_s - val);
        }
    },

    shortToInt: function(val) {
        //Sign extends a short to int
        if (val >= 0 && val < (mnemonics.short_s / 2)) {
            return val;
        } else {
            val = mnemonics.short_s - val;
            return (mnemonics.int_s - val);
        }
    },


    byteToValue: function(val) {
        //Converts unsigned byte to number
        if (val >= 0 && val < (mnemonics.byte_s / 2)) {
            return val;
        } else {
            val = val - mnemonics.byte_s;
            return (val);
        }
    },
    shortToValue: function(val) {
        //Converts unsigned short to number
        if (val >= 0 && val < (mnemonics.short_s / 2)) {
            return val;
        } else {
            val = val - mnemonics.short_s;
            return (val);
        }
    },
    intToValue: function(val) {
        //Converts unsigned int to number
        if (val >= 0 && val < (mnemonics.int_s / 2)) {
            return val;
        } else {
            val = val - mnemonics.int_s;
            return (val);
        }
    },


    convertIntegerToWords: function(val) {

        var retvals = [];

        retvals[0] = (val >> 16) & 0xffff;
        retvals[1] = val & 0xffff;

        return retvals;
    },

    convertToBytes: function(val, size) {
        var nBytes = [];

        for (var j = 0; j < size; j++){
            nBytes[j] = (val >> (8 * (size-j-1))) & 0xff;
        }

        return nBytes;
    },

    convertFromBytes: function(bArr) {
        var size = bArr.length;
        var res = 0;
        for (var j = 0; j < size; j++) {
            res += (bArr[j] << (8 * (size-j-1)));
        }
        return res;

    }
};