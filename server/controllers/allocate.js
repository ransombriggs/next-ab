'use strict';

// Set the allocation ID as a local variable.
const getAllocationID = require('../lib/get-allocation-id');
const metrics = require('ft-next-express').metrics;
const allocateTests = require('../lib/allocate-tests');

module.exports = function(req, res, next) {

	getAllocationID(req, res)
		.then(user => {
			res.locals.user = user;
		}, () => {
				metrics.count('allocation.failed.uuid', 1);
		})
		.then(() => {
			let allocation;

			if (res.locals.user) {
				allocation = allocateTests(res.locals.tests, res.locals.user);
				if (allocation) {
					res.set('ft-allocation-id', res.locals.user.uuid);
				} else {
					metrics.count('allocation.failed.tests', 1);
				}
			}

			res.set('x-ft-ab', (allocation) ? allocation : '-');

			const sessionToken = req.get('ft-session-token') || req.get('x-ft-session-token');

			if (sessionToken) {
				res.set('ft-session-token', sessionToken);
			}
		})
		.then(() => {

			if (req.get('ft-session-token') || req.get('ft-allocation-id')) {
				res
					.set('Cache-Control', 'max-age=10800, public, stale-while-revalidate=10800, stale-if-error=86400')
					.set('Outbound-Cache-Control', 'private, max-age=0, no-cache')
					.set('Vary', 'ft-allocation-id, ft-session-token');
			} else {
				res
					.set('Cache-Control', 'private, max-age=0, no-cache');
			}

			res
				.status(200)
				.send('OK');

			metrics.count(`response.quarter_seconds_taken.${Math.floor(Date.now() - res.locals.requestStart / 250)}`);
		})
		.catch(next);
};
