
"use strict";

var seedrandom = require('seedrandom');

// Given a list of AB tests and UUID, the prng will consistently
// but evenly allocate users into an A/B segment, per test.
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
