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
			const allocation = allocateTests(res.locals.tests, res.locals.user);
			if (!allocation) {
				metrics.count('allocation.failed.tests', 1);
			}
			res.set('x-ft-ab', (allocation) ? allocation : '-');
			if (allocation) {
				res.set('ft-allocation-id', res.locals.user.uuid);
			}

			const sessionToken = req.get('ft-session-token') || req.get('x-ft-session-token');
			if (sessionToken) {
				res.set('ft-session-token', sessionToken);
			}
		})
		.then(() => {
			// Metrics: Who's asking for the allocation?
			// FIXME - var interrogator = req.get('ft-interrogator') || 'unknown';
			// metrics.count('interrogator.'+interrogator, 1);
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
		})
		.catch(next);
};
