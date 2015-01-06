"use strict";

require('seedrandom');

function getNormalizedERights(eRightsId, min, max) {
	Math.seedrandom(eRightsId);

	// Source MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	// Returns a random integer between min (included) and max (excluded)
	// Using Math.round() will give you a non-uniform distribution!
	return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = [
	{
		flag: "stickyNavigation",
		allocate: function(options) {
			var decider = getNormalizedERights(options.eRightsId, 0, 9);
			switch(decider) {
				case 0: return true;
				case 1: return false;
				default: return undefined;
			}
		},
		expires: new Date("Sat Feb 01 2015 00:00:00 GMT+0000 (GMT)")
	}
];
