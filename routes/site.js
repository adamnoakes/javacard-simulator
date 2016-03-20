/*!
 * site
 *
 * This file handles the requests for the static web site.
 * 
 * @author Adam Noakes
 * University of Southampton
 */

/**
 * Module dependencies.
 * @private
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {res.render('index')});
/* GET about page */
router.get('/about', function(req, res) {res.render('about')});
/* GET simulator page */
router.get('/simulator', function(req, res) {res.render('simulator')});

module.exports = router;
