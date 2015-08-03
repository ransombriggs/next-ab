
"use strict";

var seedrandom = require('seedrandom');

// Given a list of AB tests and UUID the prng will consistently 
// but evenly distribute users in to A/B segments.
module.exports = function(tests, uuid) {

	if (!uuid || !tests || tests.length === 0) {
		return false;
	}

	var allocation = tests.map(function (test) {
		var rng = seedrandom(uuid + test.name);
		var group = (rng() > 0.5) ? 'off' : 'on';
		return test.name + ':' + group;
	});

	return allocation.join(',');

};

/*	
res.set('allocation-id', allocationID);
res.set('x-ft-ab', allocationHeader);
next();
*/

