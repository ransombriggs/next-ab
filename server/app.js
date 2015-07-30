/*jshint node:true*/
"use strict";

var express = require('ft-next-express');
var setAllocationID = require('./middleware/set-allocation-id');
var setAllocationHeader = require('./middleware/set-allocation-header');
var Metrics = express.metrics;
var app = module.exports = express({
	withHandlebars: false
});

app.get('/favicon.ico', function(req, res) {
	res.status(404).end();
});

app.get('/__gtg', function(req, res) {
	res.status(200).send('OK');
});

app.get('/__tests', function(req, res) {
	res.json(res.locals.flagsArray);
});

app.get('/', function(req, res) {
	res.redirect(302, 'https://github.com/financial-times/next-ab');
});

// Set the allocation ID as an app variable
app.use(setAllocationID);

// Set the A/B allocation as a response header
app.use(setAllocationHeader);

app.get('/*', function(req, res) {
	res
		.set('cache-control', 'private, no-cache, max-age=0')
		.status(200)
		.send('OK');
});

module.exports.listen = app.listen(process.env.PORT, function() {
	console.log("Listening on port", process.env.PORT);
	Metrics.count('express.start');
});
