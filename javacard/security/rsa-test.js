var rsaPrivateCrtKey = require('./rsa-private-crt-key.js');
var rsaPublicKey = require('./rsa-public-key.js');
var keyBuilder = require('./key-builder.js');
var cipher = require('../javacardx/crypto/cipher.js');
var rsaCipher = require('../javacardx/crypto/rsa-cipher.js');
var bignum = require('bignum');

var NodeRSA = require('node-rsa');


var modulus = [0xc9,0xce,0xd4,0x01,0x22,0x49,0x7c,0x37,0x81,0x4a,0x5f,0x1d,0xde,0x2e,0xc5,0x90,0x8b,0xde,0x12,0x16,0x0e,0xcf,0x42,0xe7,0x97,0x28,0x32,0x81,0x7f,0x56,0x1b,0x61,0x6e,0x1f,0x84,0x1d,0x56,0x17,0x57,0xe3,0xe7,0x85,0xe5,0x41,0xb9,0x0e,0x08,0xfa,0x8d,0x31,0xb2,0x34,0x29,0x6b,0x5d,0x49,0x83,0xe8,0xe2,0x7c,0x8e,0xf8,0xe2,0xdf]
var exponent = [0x01, 0x00, 0x01];
var P = [0xe6,0x37,0xa1,0x0e,0xcf,0xe8,0x9a,0xa2,0xb6,0xde,0x3b,0x9f,0x4d,0xfa,0x5d,0x92,0xb9,0x27,0x91,0xdb,0xdd,0x0d,0xaa,0x1c,0xb7,0x26,0x64,0x67,0xa5,0x7d,0x87,0xbf]; //new Buffer('00e637a10ecfe89aa2b6de3b9f4dfa5d92b92791dbdd0daa1cb7266467a57d87bf', 'hex');
var Q = [0xe0,0x68,0xb2,0x73,0xb7,0xe5,0x28,0x5f,0x70,0xda,0x56,0xb9,0xd8,0x13,0x06,0x24,0xf3,0x7c,0x13,0xb3,0x34,0x8d,0x0e,0x6e,0x47,0xac,0x32,0x8d,0x71,0xa0,0x6c,0xe1]; //new Buffer('00e068b273b7e5285f70da56b9d8130624f37c13b3348d0e6e47ac328d71a06ce1', 'hex');
var DP1 = [0x87,0xe5,0x42,0x9f,0x59,0xbf,0x36,0xb8,0xe2,0x35,0xa1,0x00,0x52,0xa9,0x7d,0xdf,0x04,0x89,0x05,0x22,0xc2,0x04,0x34,0xec,0xaa,0x78,0x71,0x40,0x75,0x81,0xfa,0x45];//new Buffer('0087e5429f59bf36b8e235a10052a97ddf04890522c20434ecaa7871407581fa45','hex');
var DQ1 = [0xa5,0x64,0xc4,0xd1,0x80,0xe1,0xc6,0x85,0xc1,0x39,0x4a,0xde,0x22,0x20,0xb3,0x50,0x9c,0x9c,0x00,0x30,0xfe,0x34,0x50,0x44,0x7b,0x52,0xb0,0xd7,0x8a,0xbd,0x80,0x41];//new Buffer('00a564c4d180e1c685c1394ade2220b3509c9c0030fe3450447b52b0d78abd8041','hex');
var PQ = [0x54,0xa9,0x9e,0x39,0x44,0xc0,0x48,0xa9,0x97,0x3f,0xf8,0x5c,0x21,0xea,0xa7,0xcc,0x37,0xdc,0x03,0xce,0xd4,0xa0,0x4a,0xb4,0xd9,0x10,0xf8,0xcf,0x8a,0x9a,0x7a,0x8d];//new Buffer('54a99e3944c048a9973ff85c21eaa7cc37dc03ced4a04ab4d910f8cf8a9a7a8d','hex');


var publicKey = new NodeRSA();
publicKey.importKey({
	n: new Buffer('00c9ced40122497c37814a5f1dde2ec5908bde12160ecf42e7972832817f561b616e1f841d561757e3e785e541b90e08fa8d31b234296b5d4983e8e27c8ef8e2df', 'hex'),
	e: 65537
}, 'components-public');

var privateKey = new NodeRSA();
privateKey.importKey({
	n: new Buffer('00c9ced40122497c37814a5f1dde2ec5908bde12160ecf42e7972832817f561b616e1f841d561757e3e785e541b90e08fa8d31b234296b5d4983e8e27c8ef8e2df', 'hex'),
	e: 65537,
	d: new Buffer('008b8517a3350e32f7b8c62f1e5a2661e63e1ca8ca6130bfa397286e4a833b87af4900b11cc5b3af5fa7980f52c596f3aa59cf3b44c44336329596455f81e87541', 'hex'),
	p: new Buffer('00e637a10ecfe89aa2b6de3b9f4dfa5d92b92791dbdd0daa1cb7266467a57d87bf', 'hex'),
	q: new Buffer('00e068b273b7e5285f70da56b9d8130624f37c13b3348d0e6e47ac328d71a06ce1', 'hex'),
	dmp1: new Buffer('0087e5429f59bf36b8e235a10052a97ddf04890522c20434ecaa7871407581fa45','hex'),
	dmq1: new Buffer('00a564c4d180e1c685c1394ade2220b3509c9c0030fe3450447b52b0d78abd8041','hex'),
	coeff: new Buffer('54a99e3944c048a9973ff85c21eaa7cc37dc03ced4a04ab4d910f8cf8a9a7a8d','hex')
}, 'components');

//var key = new NodeRSA({b: 512});
/*var encrypted = publicKey.encrypt('this');
console.log(encrypted);
console.log(privateKey.decrypt(encrypted));*/

var myCipher = cipher.getInstance(cipher.ALG_RSA_PKCS1_OAEP, false);
var myKey = keyBuilder.buildKey(keyBuilder.TYPE_RSA_CRT_PRIVATE, keyBuilder.LENGTH_RSA_512, false);
var myPublicKey = keyBuilder.buildKey(keyBuilder.TYPE_RSA_PUBLIC, keyBuilder.LENGTH_RSA_512, false);


var inBuffer = [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33];
var outBuffer = [];
var midBuffer = [];

rsaPrivateCrtKey.setP(myKey, P, 0, P.length);
rsaPrivateCrtKey.setQ(myKey, Q, 0, Q.length);
rsaPrivateCrtKey.setDP1(myKey, DP1, 0, DP1.length);
rsaPrivateCrtKey.setDQ1(myKey, DQ1, 0, DQ1.length);
rsaPrivateCrtKey.setPQ(myKey, PQ, 0, PQ.length);
rsaPublicKey.setModulus(myPublicKey, modulus, 0, modulus.length);
rsaPublicKey.setExponent(myPublicKey, exponent, 0, exponent.length);

//console.log(myKey);

rsaCipher.init(myCipher, myPublicKey, cipher.MODE_ENCRYPT);
rsaCipher.doFinal(myCipher, inBuffer, 0, inBuffer.length, midBuffer, 0);
//console.log('Public key:');
//console.log(publicKey);

//console.log('RSAPublicKey:');
//console.log(myPublicKey.key);

console.log(publicKey.encrypt(new Buffer(inBuffer)));
console.log(midBuffer);

//rsaCipher.init(myCipher, myKey, cipher.MODE_DECRYPT);
//rsaCipher.doFinal(myCipher, midBuffer, 0, midBuffer.length, outBuffer, 0);
//console.log(privateKey.decrypt(publicKey.encrypt(new Buffer(inBuffer))));
//console.log(new Buffer(outBuffer));



