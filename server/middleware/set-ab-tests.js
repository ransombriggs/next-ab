'use strict';

const metrics = require('ft-next-express').metrics;

// Set the AB tests array as a local variable.
module.exports = function(req, res, next) {

	// Note: res.locals.flagsArray is provided by next-feature-flags-client@8
	// Note: res.locals.flagsRaw will be provided by next-feature-flags-client@9
	const flagsWithABTests = (res.locals.flagsRaw || res.locals.flagsArray).filter(flag => flag.abTestState);
	const anonymousTests = flagsWithABTests.filter(flag => flag.cohorts && flag.cohorts.indexOf('anonymous') > -1);
	const subscriberTests = flagsWithABTests.filter(flag => flag.cohorts && flag.cohorts.indexOf('subscriber') > -1);

	metrics.count('tests.all.active', flagsWithABTests.length);
	metrics.count('tests.anonymous.active', anonymousTests.length);
	metrics.count('tests.subscriber.active', subscriberTests.length);

	res.locals.tests = {flagsWithABTests, anonymousTests, subscriberTests};
	next();
};
