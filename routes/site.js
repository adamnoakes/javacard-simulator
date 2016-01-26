var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {res.render('index')});
router.get('/about', function(req, res) {res.render('about')});
router.get('/simulator', function(req, res) {res.render('simulator')});

module.exports = router;
