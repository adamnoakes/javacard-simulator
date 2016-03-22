/*!
 * rsa-private-crt-key
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */
var keys = require('./keys.js');
var rsaKey = require('./rsa-key.js');
var bignum = require('bignum');

/**
 * Creates a NodeRSA key that can be used to perform encryption and
 * decryption. This cannot be stored in a database and therefore must be
 * created each time it is required.
 * 
 * @param  {RSAPrivateCrtKey} RSAPrivateCrtKey The RSAPrivateCrtKey object.
 * @param  {Number}           algorithm        The algorithm token number.
 * @return {NodeRSA}
 */
function createKey(RSAPrivateCrtKey, algorithm){
	var nodeRSAKey = rsaKey.getNodeRSA(RSAPrivateCrtKey, algorithm);
	nodeRSAKey.importKey({
		n: getModulus(RSAPrivateCrtKey.P,RSAPrivateCrtKey.Q),
		e: 65537,//[0x01, 0x00, 0x01];
		d: getPrivateExponent(RSAPrivateCrtKey.P,RSAPrivateCrtKey.Q),
		p: new Buffer(RSAPrivateCrtKey.P),
		q: new Buffer(RSAPrivateCrtKey.Q),
		dmp1: new Buffer(RSAPrivateCrtKey.DP1),
		dmq1: new Buffer(RSAPrivateCrtKey.DQ1),
		coeff: new Buffer(RSAPrivateCrtKey.PQ)
	}, 'components');
	return nodeRSAKey;
}

/**
 * Calculates the modulus component for importing into NodeRSA.
 * 
 * @param  {Array} p The p component of the RSA Key.
 * @param  {Array} q The q component of the RSA Key.
 * @return {Buffer}  The n component of the RSA Key.
 */
function getModulus(p,q){
	p = new bignum.fromBuffer(new Buffer(p));
	q = new bignum.fromBuffer(new Buffer(q));
	return p.mul(q).toBuffer();
}

/**
 * Calculates the private exponent component for importing into NodeRSA
 * 
 * @param  {Array} p The p component of the RSA Key.
 * @param  {Array} q The q component of the RSA Key.
 * @return {Buffer}  The d component of the RSA Key.
 */
function getPrivateExponent(p, q) {
    var e = new bignum(65537, 10);
    p = new bignum(p, 16);
	q = new bignum(q, 16);

    var pSub1 = p.sub(1);
    var qSub1 = q.sub(1);
    var phi = pSub1.mul(qSub1);
    return e.invertm(phi).toBuffer();
}

/**
 * When a component is set, this checks if all components are set. If they
 * are, then the key is set as initialized.
 * 
 * @param  {Function} f The setter function for the component being set.
 * @return {Function}
 */
function setterDecorator(f){
	function set(){
		f.apply(this, arguments);
		if(arguments[0].P && arguments[0].Q && arguments[0].DP1 &&
			arguments[0].DQ1 && arguments[0].PQ){
			keys.setInitialized(arguments[0]);
		}
	}
	return set;
}

/**
 * Module exports.
 */

module.exports = {
	run: function(RSAPrivateCrtKey, method, methodType, param){
		switch(method){
			case 0:
				return keys.clearKey(RSAPrivateCrtKey);
			case 1:
				return keys.getSize(RSAPrivateCrtKey);
			case 2:
				return keys.getType(RSAPrivateCrtKey);
			case 3:
				return keys.isInitialized(RSAPrivateCrtKey);
			case 4:
				return this.getDP1(RSAPrivateCrtKey, param[0], param[1]);
			case 5:
				return this.getDQ1(RSAPrivateCrtKey, param[0], param[1]);
			case 6:
				return this.getP(RSAPrivateCrtKey, param[0], param[1]);
			case 7:
				return this.getPQ(RSAPrivateCrtKey, param[0], param[1]);
			case 8:
				return this.getQ(RSAPrivateCrtKey, param[0], param[1]);
			case 9:
				return this.setDP1(RSAPrivateCrtKey, param[0], param[1], param[2]);
			case 10:
				return this.setDQ1(RSAPrivateCrtKey, param[0], param[1], param[2]);
			case 11:
				return this.setP(RSAPrivateCrtKey, param[0], param[1], param[2]);
			case 12:
				return this.setPQ(RSAPrivateCrtKey, param[0], param[1], param[2]);
			case 13:
				return this.setQ(RSAPrivateCrtKey, param[0], param[1], param[2]);
			default:
				return new Error('Method ' + method + ' not defined for RSAPrivateCrtKey');
				//throw error, cannot perform method method, methodType methodType
		}
	},

	/**
	 * [RSAPrivateCrtKey description]
	 * @constructor
	 * @param {Number} size
	 */
	RSAPrivateCrtKey: function(size){
		//extends private key
		keys.PrivateKey(this, 5, size);
		this.P = undefined;
		this.Q = undefined;
		this.DP1 = undefined;
		this.DQ1 = undefined;
		this.PQ = undefined;
		this.key = null;
	},

	getNodeRSA: function(RSAPrivateCrtKey, algorithm){
		if(RSAPrivateCrtKey.initialized === 1){
			return createKey(RSAPrivateCrtKey, algorithm);
		} else {
			return new Error('Key not initialized');
		}
	},
	getDP1: function(RSAPrivateCrtKey, buffer, offset){
		Util.arrayCopy(RSAPrivateCrtKey.DP1, 0, buffer, offset,
			len(RSAPrivateCrtKey.DP1));
		return len(RSAPrivateCrtKey.DP1);
	},
	getDQ1: function(RSAPrivateCrtKey, buffer, offset){
		Util.arrayCopy(RSAPrivateCrtKey.DQ1, 0, buffer, offset,
			len(RSAPrivateCrtKey.DQ1));
		return len(RSAPrivateCrtKey.DQ1);
	},
	getP: function(RSAPrivateCrtKey, buffer, offset){
		Util.arrayCopy(RSAPrivateCrtKey.P, 0, buffer, offset,
			len(RSAPrivateCrtKey.P));
		return len(RSAPrivateCrtKey.P);
	},
	getQ: function(RSAPrivateCrtKey, buffer, offset){
		Util.arrayCopy(RSAPrivateCrtKey.Q, 0, buffer, offset,
			len(RSAPrivateCrtKey.Q));
		return len(RSAPrivateCrtKey.Q);
	},
	getPQ: function(RSAPrivateCrtKey, buffer, offset){
		Util.arrayCopy(RSAPrivateCrtKey.PQ, 0, buffer, offset,
			len(RSAPrivateCrtKey.PQ));
		return len(RSAPrivateCrtKey.PQ);
	},
	setDP1: setterDecorator(function(RSAPrivateCrtKey, buffer, offset, length){
		RSAPrivateCrtKey.DP1 = buffer.slice(offset, offset + length);
	}),
	setDQ1: setterDecorator(function(RSAPrivateCrtKey, buffer, offset, length){
		RSAPrivateCrtKey.DQ1 = buffer.slice(offset, offset + length);
	}),
	setP: setterDecorator(function(RSAPrivateCrtKey, buffer, offset, length){
		RSAPrivateCrtKey.P = buffer.slice(offset, offset + length);
	}),
	setQ: setterDecorator(function(RSAPrivateCrtKey, buffer, offset, length){
		RSAPrivateCrtKey.Q = buffer.slice(offset, offset + length);
	}),
	setPQ: setterDecorator(function(RSAPrivateCrtKey, buffer, offset, length){
		RSAPrivateCrtKey.PQ = buffer.slice(offset, offset + length);
	}),
	setKey: setterDecorator(function(){
		var components = theKey.exportKey('components-private');
		RSAKey.P = components.p.toJSON().data;
		RSAKey.Q = components.q.toJSON().data;
		RSAKey.DP1 = components.dmp1.toJSON().data;
		RSAKey.DQ1 = components.dmq1.toJSON().data;
		RSAKey.PQ = components.coeff.toJSON().data;
	})
};
