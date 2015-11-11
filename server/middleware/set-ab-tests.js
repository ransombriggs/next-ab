'use strict';

const metrics = require('ft-next-express').metrics;
const seedrandom = require('seedrandom');

let aaOffset;
let aaaOffset;

function setCalibrationOffsets () {
	aaOffset = 5 * Math.floor(seedrandom(new Date().getMonth() + new Date().getYear())() * 20);
	aaaOffset = (aaOffset + 5) % 100;
}

setCalibrationOffsets();
setInterval(setCalibrationOffsets, 60 * 60 * 1000)

// Set the AB tests array as a local variable.
module.exports = function(req, res, next) {

	const flagsWithABTests = res.locals.flagsRaw.filter(flag => flag.abTestState);

	flagsWithABTests.forEach(f => {
		if (f.name === 'aa' || f.name === 'aaa') {
			f.abTestSetup.range = 5;

			if (f.name === 'aa') {
				f.abTestSetup.offset = aaOffset;
			} else {
				f.abTestSetup.offset = aaaOffset;
			}

		}
	})
	const anonymousTests = flagsWithABTests.filter(flag => flag.cohorts && flag.cohorts.indexOf('anonymous') > -1);
	const subscriberTests = flagsWithABTests.filter(flag => flag.cohorts && flag.cohorts.indexOf('subscriber') > -1);

	metrics.count('tests.all.active', flagsWithABTests.length);
	metrics.count('tests.anonymous.active', anonymousTests.length);
	metrics.count('tests.subscriber.active', subscriberTests.length);

	res.locals.tests = {flagsWithABTests, anonymousTests, subscriberTests};
	next();
};
