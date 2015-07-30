"use strict";

var getABTests = function(flagsArray) {
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
