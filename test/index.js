/*!
 * Tests
 *
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */
var should = require('should');
var supertest = require('supertest');
var server = supertest.agent("http://localhost:3000");

var calculatorApplet = require('./applets/calculator.js');
var rsaDecryptPKCS1_OAEPApplet = require('./applets/rsa-decrypt-pkcs1-oaep.js');
var rsaDecryptPKCS1Applet = require('./applets/rsa-decrypt-pkcs1.js');
var shaDigest = require('./applets/sha1-digest.js');

/**
 * Card Manager Tests
 */
describe('Card Manager', function(){
  var smartcard = {
    cardName: 'testCard'
  };
  it('Should create a new virtual card', function(done){
    server.post('/simulator/smartcards').send(smartcard)
    .end(function(err, res){
      if(err){
        throw err;
      }
      res.status.should.equal(200);
      done();
    });
  });
  it('Should not allow cards with same name', function(done){
    server.post('/simulator/smartcards').send(smartcard)
    .end(function(err, res){
      if(err){
        throw err;
      }
      res.status.should.equal(200);
      done();
    });
  });
  it('Should delete smartcards', function(done){
    server.del('/simulator/smartcards/' + smartcard.cardName)
    .end(function(err, res){
      if(err){
        throw err;
      }
      res.status.should.equal(200);
      done();
    });
  });
});


/**
 * Applet Tests
 */
describe('Applet', function(){
  /**
   * Calculator Applet Tests
   */
  describe('Calculator', appletTests(calculatorApplet, function(){
    describe('Basic operations', function(){
      it('Should accept numbers', sendAPDU(
          calculatorApplet.sendThree,
          '0x00 0x00 0x00 0x00 0x03 0x9000'
      ));

      it('Should evaluate equals operator', sendAPDU(
          calculatorApplet.sendEquals,
          '0x00 0x00 0x00 0x00 0x03 0x9000'
      ));
    });

    describe('Addition', function(){
      before(function(done){
        sendAPDU(
          calculatorApplet.sendThree,
          '0x00 0x00 0x00 0x00 0x03 0x9000'
        )(function(){
          sendAPDU(
            calculatorApplet.sendAddition,
            '0x00 0x00 0x00 0x00 0x03 0x9000'
          )(function(){
            sendAPDU(
              calculatorApplet.sendTwo,
              '0x00 0x00 0x00 0x00 0x02 0x9000'
            )(done);
          });
        });
      });
      it('Should evaluate 3 + 2 = 5', sendAPDU(
        calculatorApplet.sendEquals,
        '0x00 0x00 0x00 0x00 0x05 0x9000'
      ));
    });

    describe('Multiply', function(){
      it('Should evaluate 30*25', sendAPDU(
        calculatorApplet.multiplyTest,
        calculatorApplet.multiplyExpected
      ));
    });

  }));

  /**
   * RSA Decrypt Tests
   */
  describe(rsaDecryptPKCS1Applet.name, appletTests(rsaDecryptPKCS1Applet, function(){
    describe('Sending Private Key', function(){
      it('Should set P value', sendAPDU(
        rsaDecryptPKCS1Applet.sendP
      ));

      it('Should set Q value', sendAPDU(
        rsaDecryptPKCS1Applet.sendQ
      ));

      it('Should set DP1 value', sendAPDU(
        rsaDecryptPKCS1Applet.sendDP1
      ));

      it('Should set DQ1 value', sendAPDU(
        rsaDecryptPKCS1Applet.sendDQ1
      ));

      it('Should set PQ value', sendAPDU(
        rsaDecryptPKCS1Applet.sendPQ
      ));
    });

    describe('Decryption', function(){
      it('Should decrypt "hello world"', sendAPDU(
        rsaDecryptPKCS1Applet.sendEncrypted,
        rsaDecryptPKCS1Applet.encryptedResponse
      ));
    });
  }));

  describe(rsaDecryptPKCS1_OAEPApplet.name, appletTests(rsaDecryptPKCS1_OAEPApplet, function(){
    describe('Sending Private Key', function(){
      it('Should set P value', sendAPDU(
        rsaDecryptPKCS1_OAEPApplet.sendP
      ));

      it('Should set Q value', sendAPDU(
        rsaDecryptPKCS1_OAEPApplet.sendQ
      ));

      it('Should set DP1 value', sendAPDU(
        rsaDecryptPKCS1_OAEPApplet.sendDP1
      ));

      it('Should set DQ1 value', sendAPDU(
        rsaDecryptPKCS1_OAEPApplet.sendDQ1
      ));

      it('Should set PQ value', sendAPDU(
        rsaDecryptPKCS1_OAEPApplet.sendPQ
      ));
    });

    describe('Decryption', function(){
      it('Should decrypt "Hello World!"', sendAPDU(
        rsaDecryptPKCS1_OAEPApplet.sendEncrypted,
        rsaDecryptPKCS1_OAEPApplet.encryptedResponse
      ));
    });
  }));

  /**
   * SHA Digest Tests
   */
  describe(shaDigest.name, appletTests(shaDigest, function(){
    describe('Digest', function(){
      it('Should digest abc', sendAPDU(
        shaDigest.digestabc,
        shaDigest.expectedDigested
      ));
      it('Should digest "An Open Platform for the Simulation of Java Card Applets"', sendAPDU(
        shaDigest.digestAnOpenPlatform,
        shaDigest.expectedAnOpenPlatform
      ));
    });
  }));
});

/**
 * A wrapper function for testing applets, automatically sets up a testcard,
 * performs installation tests and removes the testcard once finished.
 *
 * @param  {Object} applet Object containing the applets APDU commands.
 * @param  {Function} tests  A function that contains the tests to be performed.
 */
function appletTests(applet, tests){
  return function() {
    before(function(done){
      server.post('/simulator/smartcards').send({cardName: 'testcard'})
      .end(function(err, res){
        if(err){
          throw err;
        }
        res.status.should.equal(200);
        res.body.result.should.equal(true);
        server.get('/simulator/smartcards/testcard')
        .end(function(err, res){
          if(err){
            throw err;
          }
          res.status.should.equal(200);
          res.body.result.should.equal(true);
          sendAPDU(
          [[0x00, 0xA4, 0x04, 0x00, 0x09, 0xA0, 0x00, 0x00, 0x00, 0x62, 0x03,
              0x01, 0x08, 0x01, 0x7F]]
          )(done);
        });
      });
    });

    describe('Installation', function(){
      it(
        'Should write ' + applet.name + ' components to RAM',
        sendAPDU(applet.sendComponents)
      );
      it(
        'Should write ' + applet.name + ' components to EEPROM',
        sendAPDU(applet.writeComponents)
      );
      it(
        'Should create an instance of ' + applet.name + '',
        sendAPDU(applet.createInstance)
      );
      it(
        'Should allow ' + applet.name + ' applet to be selected',
        sendAPDU(applet.selectApplet)
      );
    });

    tests();

    after(function(done){
      server.del('/simulator/smartcards/' + 'testcard').end(function(err, res){
        if(err){
          throw err;
        }
        res.status.should.equal(200);
        done();
      });
    });
  };
}

function sendAPDU(apdu, expectedResponse, timeout){
  return function(done){
    if(timeout)
      this.timeout(timeout)
    server.post('/simulator/apdu').send({'APDU': apdu})
    .end(function(err, res){
      if(err){
        throw err;
      }
      res.status.should.equal(200);
      res.body.APDU.should.equal(expectedResponse || '0x9000');
      //res.body.error.should.equal(undefined);
      done();
    });
  };
}
