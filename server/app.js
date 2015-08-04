/*jshint node:true*/
"use strict";

var express = require('ft-next-express');
var setAllocationID = require('./middleware/set-allocation-id');
var setAllocationHeader = require('./middleware/set-allocation-header');
var setABTests = require('./middleware/set-ab-tests');
var Metrics = express.metrics;
var app = module.exports = express({
	withHandlebars: false
});

app.use(function(req, res, next){
	Metrics.instrument(res, { as: 'express.http.res' });
	Metrics.instrument(req, { as: 'express.http.req' });
	next();
});

app.get('/favicon.ico', function(req, res) {
	res.status(404).end();
});

app.get('/__gtg', function(req, res) {
	res.status(200).send('OK');
});

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
	var interrogator = req.get('ft-interrogator') || 'unknown';
	Metrics.count('interrogator.'+interrogator, 1);

	res
		.set('cache-control', 'private, no-cache, max-age=0')
		.status(200)
		.send('OK');
});

module.exports.listen = app.listen(process.env.PORT, function() {
	console.log("Listening on port", process.env.PORT);
	Metrics.count('express.start');
});
