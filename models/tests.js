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
		flag: "homePageProminentFollowAB",
		description: "Testing whehter a prominent call to action above top stories encourages more following",
		expires: new Date("2015-07-01T00:00:00.000Z"),
		active: true,
		owner: "rhys.evans@ft.com"
	},
	{
		flag: "myftEngagedFollow",
		description: "Testing whehter a fixed call to action on stream pages encourages more following",
		expires: new Date("2015-06-29T00:00:00.000Z"),
		active: true,
		owner: "patrick.hamann@ft.com"
	}
];
