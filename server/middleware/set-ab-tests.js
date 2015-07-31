
"use strict";

// Set the AB tests array as a local variable.
module.exports = function(req,res,next) {

	// Note: res.locals.flagsArray is provided by next-express.
	var flagsWithABTests = res.locals.flagsArray.filter(function (flag) {
		return flag.abTestState === true;
	});

	res.locals.abTests = flagsWithABTests;
	next();
};
