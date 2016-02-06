/**
 * 
 */

module.exports = {
	run: function(id, clas, method, type, param, obj, objref, smartcard){
		switch (id.join()) {
			case opcodes.jlang.join():

			case opcodes.jframework.join():

			case opcodes.jsecurity.join():

			case opcodes.jxcrypto.join():

			default:
				return new Error('Unsupported package');
		}
	}
}