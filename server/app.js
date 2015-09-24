/*jshint node:true*/
"use strict";

var express = require('ft-next-express');
var cookieParser = require('cookie-parser');
var setAllocationID = require('./middleware/set-allocation-id');
var setAllocationHeader = require('./middleware/set-allocation-header');
var setABTests = require('./middleware/set-ab-tests');
var metrics = express.metrics;
var app = module.exports = express({
	withHandlebars: false,
	withBackendAuthentication: false
});

app.get('/favicon.ico', function(req, res) {
	res.status(404).end();
});

app.get('/__gtg', function(req, res) {
	res.status(200).send('OK');
});

app.use(cookieParser);

// Set the A/B tests array as a local variable
app.use(setABTests);

app.get('/__tests', function(req, res) {
	res.json(res.locals.tests);
});

// Set the allocation ID as a local variable
app.use(setAllocationID);

// Set the A/B allocation as a response header
app.use(setAllocationHeader);

app.get('/*', function(req, res) {

	// Metrics: Who's asking for the allocation?
	// FIXME - var interrogator = req.get('ft-interrogator') || 'unknown';
	// metrics.count('interrogator.'+interrogator, 1);

	res
		.set('cache-control', 'private, no-cache, max-age=0')
		.status(200)
		.send('OK');
});

module.exports.listen = app.listen(process.env.PORT, function() {
	console.log("Listening on port", process.env.PORT);
	metrics.count('express.start');
});
