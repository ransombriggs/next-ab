
"use strict";

var allocate = require('../allocate');

module.exports = function(req, res, next) {
	var allocation = allocate(res.locals.abTests, res.locals.allocation);
	res.set('ft-allocation-id', res.locals.allocation);
	res.set('x-ft-ab', (allocation) ? allocation : '-');
	next();
};
