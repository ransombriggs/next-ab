
"use strict";

var allocate = require('../allocate');

var thirtyDaysInSeconds = 60 * 60 * 24 * 30;

module.exports = function(req, res, next) {
	var allocation = allocate(res.locals.tests, res.locals.id);
	res.set('x-ft-ab', (allocation) ? allocation : '-');
	if (allocation) {
		res.set('ft-allocation-id', res.locals.id);

		if (!req.headers['ft-allocation-id']) {
			res.cookie('FTAllocation', res.locals.id, { domain: '.ft.com', maxAge: thirtyDaysInSeconds });
		}
	}
	next();
};
