"use strict";

module.exports = [
	{
		flag: "stickyNavigation",
		allocate: function(options) {
			// TODO: Psuedo normalize `eRightsId`
			var decider = options.eRightsId % 10;
			switch(decider) {
				case 0: return true;
				case 1: return false;
				default: return undefined;
			}
		},
		expires: new Date("Sat Feb 01 2015 00:00:00 GMT+0000 (GMT)")
	}
];
