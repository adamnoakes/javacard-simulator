var MongoClient = require('mongodb').MongoClient;
var dbURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/javacard';
var smartcards;

MongoClient.connect(dbURI, function(err, database) {
    smartcards = database.collection('smartcards');
    
 });

module.exports = {
  getSmartcards: function(){
  	return smartcards;
  },
  dbURI: dbURI,
};