"use strict";

// Set the AB tests array as an app variable.
module.exports = function(req,res) {

	app.set('abTests',[
		{
			name:'aa'
		},
		{
			name:'foo'
		},
		{
			name:'bar'
		}
	]);
	next();

/*
	var flagsWithABTests = flagsArray.filter(function (flag) {
		return flag.abTestState === true;
	});
	if (!flagsWithABTests || flagsWithABTests.length <= 0) {
		debug("Could not find any feature flags with AB tests");
		return [];
	}
	else {
		return flagsWithABTests;
	}
*/
};
