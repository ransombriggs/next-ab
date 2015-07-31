
"use strict";

var seedrandom = require('seedrandom');

module.exports = function(req,res,next){
	var allocationHeader = '-';
	var allocationID = res.locals.allocationID;
	var abTests = res.locals.abTests;

	if (allocationID && abTests) {
		var allocation = abTests.map(function (test) {
			var rng = seedrandom(allocationID + test.name);
			var group = (rng() > 0.5) ? 'off' : 'on';
			return test.name + ':' + group;
		});
		if (allocation.length > 0) {
			allocationHeader = allocation.join(',');
		}
	}

	res.append('x-ft-ab',allocationHeader);
	next();
};
