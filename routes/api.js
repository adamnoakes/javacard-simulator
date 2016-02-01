var express = require('express');
var validator = require('validator');
var router = express.Router();
var smartcard = require('../javacard/smartcard/smartcard.js');
var eeprom = require('../javacard/smartcard/eeprom.js');
var processor = require('../javacard/smartcard/processor.js');

module.exports = function () {
    var router = express.Router();
    
    /* GET smartcards -> Return available smart cards. */
	router.get('/smartcards', function(req, res){
	    req.db.collection('smartcards').find({}, { fields : { 'EEPROM.cardName':1, _id:0} }).toArray(function(e,docs){
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
	    req.db.collection('smartcards').find(
	        {"EEPROM.cardName": req.body.cardName},
	        { limit : 1 }).toArray( 
	        function(e, docs){
	            //Name already exists
	            if(docs.length > 0){
	                res.send({
	                    'result': false,
	                    'message': "Virtual smart card with name " + req.body.cardName + " already exists."
	                });
	            } else {
	                //create smartcard
	                var newcard = new smartcard.SmartCard(req.body.cardName);
	                req.db.collection('smartcards').insert(newcard, function (err, doc) {
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
	                        req.session.smartcard = newcard._id;
	                        res.send({
	                            'result': true,
	                            'cardName': eeprom.getCardName(newcard.EEPROM)
	                        });
	                    }
	                });
	            }
	        }
	    );
	});

	/* GET  smartcards/:cardName -> Load smart card, specified by cardName */
	router.get('/smartcards/:cardName', function(req, res){
		req.db.collection('smartcards').find(
	        {"EEPROM.cardName": req.params.cardName},
	        { limit : 1 }).toArray(
	        function(e, docs){
	            //Name already exists
	            if(docs.length === 0){
	                res.send({
	                    'result': false,
	                    'message': "Virtual smart card with name " + req.params.cardName + " could not be found."
	                });
	            } else {
	            	req.session.smartcard = docs[0]._id;
	                res.send({
	                    'result': true,
	                    'cardName': req.params.cardName
	                });
	            }
	        }
	    );
	});

	/* DELETE  smartcards/:cardName -> Delete smart card, specified by cardName */
	router.delete('/smartcards/:cardName', function(req, res){
		req.db.collection('smartcards').remove(
	        {"EEPROM.cardName": req.params.cardName}, function(err, docs){
	            if(err){
	            	console.log(err);
	            	res.send({
	            		'result': false,
	                    'message': "An error occured trying to remove " + req.params.cardName + "."
	            	});
	            } else {
	            	res.send({
	                    'result': true,
	                    'cardName': req.params.cardName
	                });
	            }
	        }
	    );
	});
	
	/* POST apdu -> Send APDU to card's processor for execution. */
	router.post('/apdu', function(req, res){
	    if(!req.session.smartcard){
	    	//no card selected apdu
	        res.send({'APDU': "0x6A82"});
	    } else {
	        var response = undefined;
	        console.log(req.session.smartcard);
	        req.db.collection('smartcards').findOne(
	        	{ _id: require('mongodb').ObjectID(req.session.smartcard) }, function(err,smartcard){
	        	if(err || !smartcard){
	        		console.log(err);
	        		res.end();
	        	} else {
	        		//@this must be replaced with an ascynronous function to allow the app to scale 
	          		for(i=0; i<req.body.APDU.length; i++){
			            if(req.body.APDU[i][0] != null){
			                response = processor.process(smartcard, req.body.APDU[i]);
			                if(response == ""){
			                	//TODO -> send error
			                    break;
			                }
			            }
			        }
					req.db.collection('smartcards').update(
						{ _id: require('mongodb').ObjectID(req.session.smartcard) },
						smartcard,
						{ upsert: true }, function(err, reuslt){
							if (err) {
								//TODO -> send error
		                   		console.log(err);
		                	}
		                	res.send({'APDU': response});
						}
					);
	        	}
	        	
        	});
	    }
	});

    return router;
}