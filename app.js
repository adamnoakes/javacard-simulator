var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var validator = require('validator');
var session = require('express-session');
var MongoStore = require('connect-mongo/es5')(session);
var app = express();
var mongo = require('mongodb');
var monk = require('monk');
var dbURI = process.env.MONGOLAB_URI || 'localhost:27017/javacard';
var db = monk(dbURI);


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
    res.end();
    res.status(err.status || 500);
    console.log(here);
    console.log(err.message);
});

app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use(session({
    secret: '8Rw6jqB4ld0mHQ0RCZ3FT28BsbKA1Qgs',
    store: new MongoStore({
        url: 'mongodb://' + dbURI,
        ttl: 14 * 24 * 60 * 60, // = 14 days. Default
        autoRemove: 'native' // Default 
    }),
    resave: true,
    saveUninitialized: true
}));

app.use(require('./routes/site'));
app.use('/simulator', require('./routes/api')(db));

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
