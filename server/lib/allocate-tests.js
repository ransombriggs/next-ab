'use strict';

const metrics = require('ft-next-express').metrics;
const seedrandom = require('seedrandom');

// Given a list of AB tests and UUID, the prng will consistently
// but evenly allocate users into an A/B segment, per test.
module.exports = function(tests, user) {

	if (!(tests && tests.flagsWithABTests.length)) {
		return false;
	}

	metrics.count('allocation.count', 1);

	const allocatedTests = user.isSubscriber ? tests.subscriberTests : tests.anonymousTests;

	const userRng = seedrandom(user.uuid);
	const userRange = userRng() * 100;

	const testsInRange = allocatedTests.filter(function(test) {
		if (!test.abTestSetup) return false;
		return test.abTestSetup.offset + test.abTestSetup.range < 101;
	}).filter(function(test) {
		// Check user range is in test range
		return test.abTestSetup.offset < userRange && userRange < (test.abTestSetup.offset + test.abTestSetup.range);
	});

	const allocation = testsInRange.map(function (test) {
		const variants = (test.abTestSetup && test.abTestSetup.variants) ? test.abTestSetup.variants.concat(['control']) : ['variant', 'control'];
		let index = Math.floor(seedrandom(user.uuid + test.name)() * variants.length);
		let group = variants[index];

		// Metrics: Track A/B allocation
		metrics.count(`allocation.${test.name}.${group}`, 1);

		// HACK: Track legacy allocations for a little while to avoid healthchecks going insane
		if (variants.length === 2) {
			if (group === 'control') {
				metrics.count(`allocation.${test.name}.off`, 1);
			} else if (group === 'variant') {
				metrics.count(`allocation.${test.name}.on`, 1);
			}
		}

		return test.name + ':' + group;
	});

	return allocation.join(',');
};
