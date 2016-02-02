//import arrayindexoutofboundsexception
//import cryptoexception
var key = require('./key.js');

//try important Crypto.Public key

module.exports = {
	PublicKey: function(typ, size){
		//public key extends key
		key.key(this, typ, size);
	},
	RSAPublicKey: function(PublicKey){
		PublicKey
	}
}