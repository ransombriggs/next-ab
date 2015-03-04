/*jshint node:true*/
"use strict";

var express = require('ft-next-express');
var app = module.exports = express();

app.get('/__gtg', function(req, res) {
	res.status(200).send('OK');
});

app.get('/', function(req, res) {
	res.redirect(302, 'https://github.com/financial-times/next-ab');
});

app.get(/(.*)/, require('./controllers/grouper'));

module.exports.listen = app.listen(process.env.PORT, function() {
	console.log("Listening on port", process.env.PORT);
});
