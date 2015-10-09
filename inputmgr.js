var path = require('path');
var fs = require('fs'); 
var p = "/Users/adamnoakes/cardstemp/";




var handleInput = function(req, res){
	var words = req.body.command.split(" ");
	switch(words[0]){
		case "ls":
			sendCards(res);
			break;
		case "load":
			break;
		default:
			res.end();
	};
};

function sendCards(res){
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

module.exports = {
	handleInput: handleInput
};