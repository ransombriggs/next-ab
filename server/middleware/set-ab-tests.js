
"use strict";

var metrics = require('ft-next-express').metrics;

// Set the AB tests array as a local variable.
module.exports = function(req, res, next) {

	// Note: res.locals.flagsArray is provided by next-express.
	var flagsWithABTests = res.locals.flagsArray.filter(function (flag) {
		return flag.abTestState === true;
	});

	var anonymousTests = flagsWithABTests.filter(function (flag) {
		// Group flags for anon users. Flags without a cohort are assumed to be
		// for all users
		return flag.cohort === 'anonymous' || flag.cohort === 'all' || !flag.cohort;
	});

	var subscriberTests = flagsWithABTests.filter(function (flag) {
		// Group flags for subscribers. Flags without a cohort are assumed to be
		// for all users
		return flag.cohort === 'subscriber' || flag.cohort === 'all' || !flag.cohort;
	});

	metrics.count('tests.active', flagsWithABTests.length);

	res.locals.tests = {flagsWithABTests, anonymousTests, subscriberTests};
	next();
};
