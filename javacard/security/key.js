/*should import s1*/

modules.exports = {
	
    /* 
     * Used to transform long to Array
     * >>> longToArray(25)
     * [25]
     * >>> longToArray(4867)
     * [3, 19]
     */
	longToArray: function(long){
		var s = long.toString(16);
		if ((s.length % 2) !== 0){
		    s = '0' + s;
		}
		var out = [];
		for(var i= s.length; i>0; i = i - 2){
		    out.push(parseInt(s.substr(i-2, 2), 16));
		}
	},
	/*
     * make a long from an Array
     * >>> arrayTolong([25])
     * 25
     * >>> arrayTolong([3, 19])
     * 4867
     */
	arrayToLong: function(bytes){
		var l;
		for(var i = bytes.length-1; i > -1; i--){
			l = l << 8;
			l += bytes[i];
		}
		return l;
	},

	binaryToarray: function(bytes){
		//incomplete
	},

	arrayTobinary: function(array){
		//incomplete
	},

	key: function(key, typ, size){
		key.initialized = false;
		key.size = size;
		key.type = type;
	},

	isInitialized: function(key){
		return key.initialized
	},

	setInitialized: function(key){
		key.initialized = true
	},

	clearKey: function(key){
		return;
	},

	getType: function(key){
		return key.type
	},

	getSize: function(key){
		return key.size;
	}
};