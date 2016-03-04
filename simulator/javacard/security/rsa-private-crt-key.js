/*!
 * rsa-private-key
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

//cannot be saved like this in DB, but be exported on saving and then imported on load
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

function getModulus(p,q){
	var p = new bignum.fromBuffer(new Buffer(p));
	var q = new bignum.fromBuffer(new Buffer(q));
	return p.mul(q).toBuffer();
}
//derived from http://stackoverflow.com/questions/34142666/java-card-rsaprivatecrtkey-private-exponent-d
function getPrivateExponent(p, q) {
    var e = new bignum(65537, 10);
    var p = new bignum(p, 16);
    var q = new bignum(q, 16);

    var pSub1 = p.sub(1);
    var qSub1 = q.sub(1);
    var phi = pSub1.mul(qSub1);
    return e.invertm(phi).toBuffer();
}

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
	/**
	 * @param {RSAKey} 	RSAKey
	 * @param {Array} 	buffer
	 * @param {Number} 	offset
	 */
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
	setKey: setterDecorator(rsaKey.setKey)
};
