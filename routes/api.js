var express = require('express');
var validator = require('validator');
var router = express.Router();
var smartCardJS = require('../smartcard.js');
var processorJS = require('../processor.js');
var eepromJS = require('../eeprom.js');
var javacard;

function isCyclic (obj) {
  var seenObjects = [];

  function detect (obj) {
    if (obj && typeof obj === 'object') {
      if (seenObjects.indexOf(obj) !== -1) {
        return true;
      }
      seenObjects.push(obj);
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && detect(obj[key])) {
          console.log(obj, 'cycle at ' + key);
          return true;
        }
      }
    }
    return false;
  }

  return detect(obj);
}

module.exports = function (db) {
	var smartcardsCollection = db.get('smartcards');
    var router = express.Router();
    
    /* GET smartcards -> Return available smart cards. */
	router.get('/smartcards', function(req, res){
	    smartcardsCollection.find({},{ cardName: true },function(e,docs){
	        res.send(docs);
	    });
	});

    /* POST smartcards -> New smart card. */
	router.post('/smartcards', function(req, res){
	    //validate name
	    if(!validator.isAlphanumeric(req.body.cardName))
	        res.send({
	        'result': false,
	        'message': "Alphanumeric characters only."
	    });
	    
	    //Check if the cardname already exists
	    smartcardsCollection.find(
	        {cardName: req.body.cardName},
	        { limit : 1 }, 
	        function(e, docs){
	            //Name already exists
	            if(docs.length > 0){
	                res.send({
	                    'result': false,
	                    'message': "Virtual smart card with name " + req.body.cardName + " already exists."
	                });
	            } else {
	                //create smartcard
	                var newcard = new smartCardJS.SmartCard(req.body.cardName);
	                smartcardsCollection.insert(newcard, function (err, doc) {
	                    if (err) {
	                    	console.log(err)
	                        // If it failed, return error
	                        res.send({
	                            'result': false,
	                            'message': "There was a problem adding the information to the database."
	                        });
	                    } else {
	                        //success
	                        console.log(doc);
	                        req.session.smartcard = doc["_id"];
	                        res.send({
	                            'result': true,
	                            'cardName': newcard.processor.getCardName()
	                        });
	                    }
	                });
	            }
	        }
	    );
		/*console.log(req.body.cardName);
	    javacard = new smartCardJS.SmartCard(req.body.cardName);
	    res.send({
	        'result': true,
	        'cardName': javacard.processor.getCardName()
	    });*/
	});
	
	/* POST apdu -> Send APDU to card's processor for execution. */
	router.post('/apdu', function(req, res){
	    if(req.session.smartcard == null){
	        res.send({'APDU': "0x6A82"});
	    } else {
	        var response = undefined;
	        console.log(req.body.APDU);
	        console.log(req.session.smartcard);
	        smartcardsCollection.findOne( { _id: req.session.smartcard }, function(err,doc){ 
          		for(i=0; i<req.body.APDU.length; i++){
		            if(req.body.APDU[i][0] != null){
		            	console.log(doc);

		            	//this is not good --> fix this
		            	doc.processor.__proto__ = processorJS.Processor.prototype;
		            	
		                response = doc.processor.process(req.body.APDU[i]);
		                smartcardsCollection.update(
		                	{ _id: req.session.smartcard },
		                	doc, { upsert: true }
		                	);
		                console.log("response: " + response);
		                if(response == ""){
		                    break;
		                }
		            }
		        }
		        res.send({'APDU': response});
        	});
	        
	    }
	});

    return router;
}