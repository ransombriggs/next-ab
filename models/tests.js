"use strict";

module.exports = [
	{
		flag: "aa",
		expires: new Date("Sat Feb 01 2016 00:00:00 GMT+0000 (GMT)"),
		description: "An A/A test is an experiment where the two alternatives exactly the same. This helps to calibrate the A/B test tool.",
		active: true,
		owner: "matt.chadburn@ft.com"
	},
	{
		flag: "myftEngagedFollow",
		description: "Testing whehter a fixed call to action on stream pages encourages more following",
		expires: new Date("2015-06-29T00:00:00.000Z"),
		active: true,
		owner: "patrick.hamann@ft.com"
	},
	{
		flag: "ratingsMetadata",
		description: "does adding star ratings to article cards in stream pages lead to more dwells on those articles?",
		expires: new Date("2015-10-17T23:59:59.000Z"),
		active: true,
		owner: "matthew.andrews@ft.com"
	}
];
