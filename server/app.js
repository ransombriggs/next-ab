/*jshint node:true*/
'use strict';

const express = require('ft-next-express');
const setAllocationID = require('./middleware/set-allocation-id');
const setAllocationHeader = require('./middleware/set-allocation-header');
const setABTests = require('./middleware/set-ab-tests');
const metrics = express.metrics;
const nHealth = require('n-health');
const app = module.exports = express({
	withHandlebars: false,
	withBackendAuthentication: false,
	healthChecks:[
		require('./health/segmentation'),
		nHealth.runCheck({
			type: 'graphiteSpike',
			numerator: 'heroku.ab.*.express.default_route_GET.res.status.5**.count',
			divisor: 'heroku.ab.*.express.default_route_GET.res.status.*.count',
			threshold: 5,
			name: '500 rate is acceptable',
			severity: 3,
			businessImpact: 'Significantly fewer users than normal will be allocated to AB testing segments',
			technicalSummary: 'The proportion of requests responding with a 5xx status is at least 5 times higher than the baseline level',
			panicGuide: 'asd'
		})
	]
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
