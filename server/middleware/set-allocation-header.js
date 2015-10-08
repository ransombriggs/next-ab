
"use strict";

var allocate = require('../allocate');

module.exports = function(req, res, next) {
	var allocation = allocate(res.locals.tests, res.locals.user);
	res.set('x-ft-ab', (allocation) ? allocation : '-');
	if (allocation) {
		res.set('ft-allocation-id', res.locals.user.uuid);
	}
	next();
};
