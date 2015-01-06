"use strict";

module.exports = [
	{
		flag: "stickyNavigation",
		grouper: function(options) {
			var decider = options.eRightsId % 10;
			return decider === 0 ? true : (decider === 1 ? false : undefined);
		},
		expires: new Date("Sat Feb 01 2015 00:00:00 GMT+0000 (GMT)")
	}
];
