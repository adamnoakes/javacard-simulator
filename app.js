var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var tools = require('./code.js');
var inputMgr = require('./inputmgr.js');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view options', {pretty: true});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            console.log(here);
            console.log(err.message);
                         });

//app.use('/', routes);
//app.use('/users', users);

app.get('/', function(req, res) {res.render('index')});

app.get('/getcard', function(req, res) {
    var fs = require('fs');
    var p = "/Users/adamnoakes/cardstemp/";
    var cardLoc = p + req.query.cardName;
    var data = {cardName: req.query.cardName, appletInstance: [], eeprom: [], packageApplet: [], packageTable: []};

    //data.cardName = req.body.cardName;
    data.entries.push({val1: '1', val2: '2', val3: 'F0 F0 DD 0A', val4: '131'});

    res.send(JSON.stringify(data));

});

app.get('/ls', function(req, res){
    tools.sendCards(res);
});
//reads synchronously then return result - currently solution may be slow
app.get('/backupall', function(req, res){
    var fs = require('fs');
    var p = "/Users/adamnoakes/cardstemp/";
    var cardLoc = p + req.query.cardName + '/';
    var values = [];
    var count = 0;

    var end = function(){ 
        count++;
        if (count == 6) {
            res.send(JSON.stringify(values));
        }
    };

    var readFile = function(filename, index){
        fs.readFile(cardLoc + filename, 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            }
            values[index] = data;
            end();
        });
    };

    readFile('APIheap.txt', 0);
    readFile('AppletInstance.csv', 1);
    readFile('EEPROM.csv', 2);
    readFile('PackageApplet.csv', 3);
    readFile('PackageTable.csv', 4);
    readFile(req.query.pkID + '/static_fields.txt', 5);
});

//needs some checking to confirm it was sucesfull
app.post('/recoverall', function(req, res){
    var fs = require('fs');
    var p = "/Users/adamnoakes/cardstemp/";
    var cardLoc = p + req.body.cardName + '/';
    var values = req.body["values[]"];

    var writeFile = function(filename, index){
        fs.open(cardLoc + filename, 'w', function(err, fd) {
            if(err) {
                return console.log(err);
            }
            fs.write(fd, values[index], function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        });
    };

    writeFile('APIheap.txt', 0);
    writeFile('AppletInstance.csv', 1);
    writeFile('EEPROM.csv', 2);
    writeFile('PackageApplet.csv', 3);
    writeFile('PackageTable.csv', 4);
    writeFile(req.body.pkID + '/static_fields.txt', 5);
    res.end();
});

app.delete('/deletecard', function(req, res) {
    var fs = require('fs');
    var rmdir = require('rimraf');
    var p = "/Users/adamnoakes/cardstemp/";
    var cardLoc = p + req.body.cardName;
    rmdir(cardLoc, function(err) {
        if(err){
            console.log(err.message);
            return console.log(err);
        }

        /*
         * Duplicate code from newcard, consider creating a function
         */
        fs.readdir(p, function(err, filenames) {
            var javaCards = [];

            filenames.filter(function (file) {
                return fs.statSync(path.join(p, file)).isDirectory();
            }).forEach(function (file) {
                javaCards.push({cardName : file});
            });
            res.send(JSON.stringify(javaCards));
        });

    });
});

app.post('/newHeap', function(req, res){

});

app.post('/newcard', function(req, res){tools.newCard(req, res)});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
