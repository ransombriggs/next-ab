'use strict';

const metrics = require('ft-next-express').metrics;

// Set the AB tests array as a local variable.
module.exports = function(req, res, next) {

	// Note: res.locals.flagsArray is provided by next-express.
	const flagsWithABTests = res.locals.flagsArray.filter(function (flag) {
		return flag.abTestState === true;
	});

	const anonymousTests = flagsWithABTests.filter(function (flag) {
		// Group flags for anon users.
		return flag.cohorts && flag.cohorts.indexOf('anonymous') > -1;
	});

	const subscriberTests = flagsWithABTests.filter(function (flag) {
		// Group flags for subscribers.
		return flag.cohorts && flag.cohorts.indexOf('subscriber') > -1;
	});

	metrics.count('tests.all.active', flagsWithABTests.length);
	metrics.count('tests.anonymous.active', anonymousTests.length);
	metrics.count('tests.subscriber.active', subscriberTests.length);

	res.locals.tests = {flagsWithABTests, anonymousTests, subscriberTests};
	next();
};
