'use strict';

const metrics = require('ft-next-express').metrics;
const seedrandom = require('seedrandom');

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

	const allocatedTests = user.isSubscriber ? tests.subscriberTests : tests.anonymousTests;

	const allocation = allocatedTests.map(function (test) {
		let rng = seedrandom(user.uuid + test.name);
		let group = (rng() > 0.5) ? 'off' : 'on';

		// Metrics: Track A/B allocation
		metrics.count('allocation.' + test.name + '.' + group, 1);

		return test.name + ':' + group;
	});

	return allocation.join(',');
};
