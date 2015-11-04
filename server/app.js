/*jshint node:true*/
'use strict';

const express = require('ft-next-express');
const setABTests = require('./middleware/set-ab-tests');
const metrics = express.metrics;
const nHealth = require('n-health');

express.logger.addSplunk(process.env.SPLUNK_URL);

const app = module.exports = express({
	withHandlebars: false,
	withBackendAuthentication: false,
	healthChecks:[
		require('./health/segmentation'),
		require('./health/cdn-segmentation'),
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

app.get('/__docs', function(req, res) {
	res.redirect(301, 'https://ft-next-ammit.herokuapp.com/');
});

// Set the A/B tests array as a local variable
app.use(setABTests);

app.get('/__tests', function(req, res) {
	res.json(res.locals.tests);
});

app.get('/*', require('./controllers/allocate'));

module.exports.listen = app.listen(process.env.PORT, function() {
	console.log('Listening on port', process.env.PORT);
	metrics.count('express.start');
});
