
"use strict";

var metrics = require('ft-next-express').metrics;

// Set the AB tests array as a local variable.
module.exports = function(req, res, next) {

	// Note: res.locals.flagsArray is provided by next-express.
	var flagsWithABTests = res.locals.flagsArray.filter(function (flag) {
		return flag.abTestState === true;
	});

	metrics.count('tests.active', flagsWithABTests.length);

	res.locals.tests = flagsWithABTests;
	next();
};
