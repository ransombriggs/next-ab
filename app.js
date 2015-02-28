/*jshint node:true*/
"use strict";

var express = require('ft-next-express');
var app = module.exports = express();

app.get('/ab', require('./controllers/grouper'));

app.get('/__gtg', function(req, res) {
	res.status(200).send('OK');
});

app.get('/', function(req, res) {
	res.redirect(302, 'https://github.com/financial-times/next-ab');
});

module.exports.listen = app.listen(process.env.PORT, function() {
	console.log("Listening on port", process.env.PORT);
});
