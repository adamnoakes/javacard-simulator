/*!
 * Tests
 *
 * @author Adam Noakes
 * University of Southamption
 */

/**
 * Module dependencies.
 * @private
 */
var should = require('should');
var supertest = require('supertest');
var server = supertest.agent("http://localhost:3000");

var calculatorApplet = require('./applets/calculator.js');
var rsaDecryptApplet = require('./applets/rsa-decrypt.js');

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
  //TODO -> should list cards
  it('Should list installed cards');
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

  }));

  /**
   * RSA Decrypt Tests
   */
  describe('RSA Decrypt', appletTests(rsaDecryptApplet, function(){
    describe('Sending Private Key', function(){
      it('Should set P value', sendAPDU(
        rsaDecryptApplet.sendP
      ));

      it('Should set Q value', sendAPDU(
        rsaDecryptApplet.sendQ
      ));

      it('Should set DP1 value', sendAPDU(
        rsaDecryptApplet.sendDP1
      ));

      it('Should set DQ1 value', sendAPDU(
        rsaDecryptApplet.sendDQ1
      ));

      it('Should set PQ value', sendAPDU(
        rsaDecryptApplet.sendPQ
      ));
    });

    describe('Decryption', function(){
      it('Should decrypt "Hello World!"', sendAPDU(
        rsaDecryptApplet.sendEncrypted,
        '0x00 0x00 0x00 0x00 0x00 0x48 0x65 0x6c 0x6c 0x6f 0x20 0x57 0x6f 0x72 0x6c 0x64 0x21 0x9000'
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
        sendAPDU(
          [[0x00, 0xA4, 0x04, 0x00, 0x09, 0xA0, 0x00, 0x00, 0x00, 0x62, 0x03,
              0x01, 0x08, 0x01, 0x7F]]
        )(done);
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

function sendAPDU(apdu, expectedResponse){
  return function(done){
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
