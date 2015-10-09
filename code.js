var path = require('path');
var fs = require('fs'); 
var p = "/Users/adamnoakes/cardstemp/";

module.exports = {
	newCard: function(req, res){
		var sendCards = function(){
			fs.readdir(p, function(err, filenames) {
	            var javaCards = [];
	            filenames.filter(function (file) {
	                return fs.statSync(path.join(p, file)).isDirectory();
	            }).forEach(function (file) {
	                javaCards.push({cardName : file});
	            });
	            res.send(JSON.stringify(javaCards));
	        });
		};

		if (req.body.cardName != ""){
		    var cardLoc = p + req.body.cardName + "/";
		    fs.mkdir(cardLoc, function(err) { 
		        if(err) {
		            //add some code for if directory/ card already exists
		            console.log("here");
		            console.log(err.message);
		            return console.log(err);
		        }
		        // path was created unless there was error
		        fs.closeSync(fs.openSync(cardLoc + 'PackageTable.csv', 'w')); 
		        fs.closeSync(fs.openSync(cardLoc + 'PackageApplet.csv', 'w')); 
		        fs.closeSync(fs.openSync(cardLoc + 'AppletInstance.csv', 'w')); 

		        fs.open(cardLoc + 'EEPROM.csv', 'w', function(err, fd) {
		            fs.write(fd, 'A10,0', function(err) {
		                if(err) {
		                    return console.log(err);
		                }
		            });
		        });

		        fs.open(cardLoc + 'APIheap.txt', 'w', function(err, fd) {
		            fs.write(fd, 'f0A/'+'//////'+'//////;', function(err) {
		                if(err) {
		                    return console.log(err);
		                }
		            });
		        });

		        sendCards();

		    });
		} else {
			sendCards();
		}
	},

	newHeap: function(req, res){
		var cardLoc = p + req.body.cardName + "/";
		fs.open(cardLoc + 'EEPROM.csv', 'w', function(err, fd){
			if(err){
				return console.log(err);
			}
		});
	},

	sendCards: function(res){
		fs.readdir(p, function(err, filenames) {
	        var javaCards = [];
	        filenames.filter(function (file) {
	            return fs.statSync(path.join(p, file)).isDirectory();
	        }).forEach(function (file) {
	            javaCards.push({cardName : file});
	        });
	        res.send(JSON.stringify(javaCards));
	    });
	}
};