/*jshint node:true*/
'use strict';

const express = require('ft-next-express');
const setAllocationID = require('./middleware/set-allocation-id');
const setAllocationHeader = require('./middleware/set-allocation-header');
const setABTests = require('./middleware/set-ab-tests');
const metrics = express.metrics;
const app = module.exports = express({
	withHandlebars: false,
	withBackendAuthentication: false
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
	// FIXME - var interrogator = req.get('ft-interrogator') || 'unknown';
	// metrics.count('interrogator.'+interrogator, 1);

	res
		.set('cache-control', 'private, no-cache, max-age=0')
		.status(200)
		.send('OK');
});

module.exports.listen = app.listen(process.env.PORT, function() {
	console.log('Listening on port', process.env.PORT);
	metrics.count('express.start');
});
