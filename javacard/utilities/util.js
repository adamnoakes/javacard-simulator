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
	}
}