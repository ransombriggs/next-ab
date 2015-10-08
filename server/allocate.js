
"use strict";

var metrics = require('ft-next-express').metrics;
var seedrandom = require('seedrandom');

// Given a list of AB tests and UUID, the prng will consistently
// but evenly allocate users into an A/B segment, per test.
module.exports = function(tests, user) {

	if (!user || !user.uuid) {
		metrics.count('allocation.failed.uuid', 1);
		return false;
	}

	if (!tests || tests.flagsWithABTests.length === 0) {
		metrics.count('allocation.failed.tests', 1);
		return false;
	}

	var allocatedTests = user.isSubscriber ? tests.subscriberTests : tests.anonymousTests;

	var allocation = allocatedTests.map(function (test) {
		var rng = seedrandom(user.uuid + test.name);
		var group = (rng() > 0.5) ? 'off' : 'on';

		// Metrics: Track A/B allocation
		metrics.count('allocation.' + test.name + '.' + group, 1);

		return test.name + ':' + group;
	});

	return allocation.join(',');
};
