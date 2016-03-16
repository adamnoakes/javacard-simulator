
/*
 * Handles the requests for the simulator application
 */

var express = require('express');
var validator = require('validator');
var router = express.Router();
var smartcard = require('../simulator/smartcard/smartcard.js');
var eeprom = require('../simulator/smartcard/eeprom.js');
var smartcard = require('../simulator/smartcard/smartcard.js');

module.exports = function () {
    var router = express.Router();

    /* GET smartcards -> Return available smart cards. */
	router.get('/smartcards', function(req, res){
		if(!req.session.smartcards){
			req.session.smartcards = {};
		}
	    res.send(Object.keys(req.session.smartcards));
	});

    /* POST smartcards -> New smart card. */
	router.post('/smartcards', function(req, res){
		if(!req.session.smartcards){
			req.session.smartcards = {};
		}
	    //validate name
	    if(!validator.isAlphanumeric(req.body.cardName))
	        res.send({
	        'result': false,
	        'message': "Alphanumeric characters only."
	    });

	    //Check if the cardname already exists
	    if(req.session.smartcards[req.body.cardName]){
	    	res.send({
                'result': false,
                'message': "Virtual smart card with name " + req.body.cardName + " already exists."
            });
	    } else {
	    	var newcard = new smartcard.Smartcard(req.body.cardName);
            req.db.collection('smartcards').insert(newcard, function (err, doc) {
                if (err) {
                	console.log(err);
                    // If it failed, return error
                    res.send({
                        'result': false,
                        'message': "There was a problem adding the information to the database."
                    });
                } else {
                    //success
                    req.session.smartcards[req.body.cardName] = newcard._id;
                    res.send({
                        'result': true,
                        'cardName': newcard.EEPROM.cardName
                    });
                }
            });
	    }
	});

	/* GET  smartcards/:cardName -> Load smart card, specified by cardName */
	router.get('/smartcards/:cardName', function(req, res){
		if(!req.session.smartcards){
			req.session.smartcards = {};
		}
		if(req.session.smartcards[req.params.cardName]){
			req.session.loadedCard = req.session.smartcards[req.params.cardName];
			res.send({
                'result': true,
                'cardName': req.params.cardName
            });
		} else {
			 res.send({
                'result': false,
                'message': "Virtual smart card with name " + req.params.cardName + " could not be found."
            });
		}
	});

	/* DELETE  smartcards/:cardName -> Delete smart card, specified by cardName */
	router.delete('/smartcards/:cardName', function(req, res){
		if(!req.session.smartcards){
			req.session.smartcards = {};
		}
		var smartcardId = req.session.smartcards[req.params.cardName];
		if(smartcardId){
			req.db.collection('smartcards').remove(
		        {_id: require('mongodb').ObjectID(smartcardId)}, function(err, docs){
		            if(err){
		            	console.log(err);
		            	res.send({
		            		'result': false,
		                    'message': "An error occured trying to remove " + req.params.cardName + "."
		            	});
		            } else {
		            	req.session.smartcards[req.params.cardName] = undefined;
		            	res.send({
		                    'result': true,
		                    'cardName': req.params.cardName
		                });
		            }
		        }
		    );
		} else {
			res.send({
        		'result': false,
                'message': "No card with name: " + req.params.cardName + "."
        	});
		}
		
	});

	/* POST apdu -> Send APDU to card's processor for execution. */
	router.post('/apdu', function(req, res){
	    if(!req.session.loadedCard){
	    	//no card selected apdu
	        res.send({
	        	'APDU': "0x6A82",
	        	'error': 'No smartcard currently loaded.'
	        });
	    } else {
	        //Load the smartcard from the user's session
	        req.db.collection('smartcards').findOne(
	        	{ _id: require('mongodb').ObjectID(req.session.loadedCard) },
	        	function(err,loadedCard){
	        		//Check smartcard was loaded successfully
		        	if(err || !loadedCard){
		        		console.log(err);
		        		res.send({
		        			'APDU': "0x6A82",
		        			'error': 'Could not find smartcard'
		        		});
		        	} else {
		        		smartcard.process(loadedCard, req.body.APDU, function(executionError, apduResponse){
		        			//Update the smartcard object
		        			req.db.collection('smartcards').update(
								{ _id: require('mongodb').ObjectID(req.session.loadedCard) },
								loadedCard,
								{ upsert: true }, function(err, result){
									if (err) {
				                   		console.log(err);
				                	} else if(executionError){
				        				res.send({
				        					'APDU': apduResponse,
				        					'error': executionError.message
				        				});
		        					} else {
					                	res.send({'APDU': apduResponse});
									}
		        				}
							);
		        		});
		        	}
        		}
        	);
	    }
	});

    return router;
};
