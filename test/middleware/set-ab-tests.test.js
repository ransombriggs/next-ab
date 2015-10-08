/* global describe, it */

'use strict';

var setAB = require('../../server/middleware/set-ab-tests');
var expect = require('chai').expect;
var req = {};
var res = {
	locals : {
		flagsArray: [
		{
			"name": "aaANON",
			"description": "An A/A test is an experiment where the two alternatives are exactly the same. This helps to calibrate the A/B test tool.",
			"owner": "matt.chadburn@ft.com",
			"safeSate": false,
			"state": false,
			"tags": [
				"calibration",
				"tool",
				"next-ab"
			],
			"expiry": "2030-01-01T00:00:00.000Z",
			"abTestState": true,
			"cohort": "anonymous"
		},
		{
			"name": "aaSUB",
			"description": "An A/A test is an experiment where the two alternatives are exactly the same. This helps to calibrate the A/B test tool.",
			"owner": "matt.chadburn@ft.com",
			"safeSate": false,
			"state": false,
			"tags": [
				"calibration",
				"tool",
				"next-ab"
			],
			"expiry": "2030-01-01T00:00:00.000Z",
			"abTestState": true,
			"cohort": "subscriber"
		},
		{
			"name": "aaBOTH",
			"description": "An A/A test is an experiment where the two alternatives are exactly the same. This helps to calibrate the A/B test tool.",
			"owner": "matt.chadburn@ft.com",
			"safeSate": false,
			"state": false,
			"tags": [
				"calibration",
				"tool",
				"next-ab"
			],
			"expiry": "2030-01-01T00:00:00.000Z",
			"abTestState": true,
			"cohort": "all"
		},
		{
			"name": "aa",
			"description": "An A/A test is an experiment where the two alternatives are exactly the same. This helps to calibrate the A/B test tool.",
			"owner": "matt.chadburn@ft.com",
			"safeSate": false,
			"state": false,
			"tags": [
				"calibration",
				"tool",
				"next-ab"
			],
			"expiry": "2030-01-01T00:00:00.000Z",
			"abTestState": true
		},
		{
			"name": "NOTaa",
			"description": "An A/A test is an experiment where the two alternatives are exactly the same. This helps to calibrate the A/B test tool.",
			"owner": "matt.chadburn@ft.com",
			"safeSate": false,
			"state": false,
			"tags": [
				"calibration",
				"tool",
				"next-ab"
			],
			"expiry": "2030-01-01T00:00:00.000Z",
		}
		]
	}
};

var getFlagNames = function (flags) {
	return flags.map(function(flag) {
		return flag.name;
	});
};

describe('Set AB tests middleware', function() {
	it('should pass all ab test flags', function() {
		setAB(req, res, function() {
			var flagNames = getFlagNames(res.locals.tests.flagsWithABTests);
			expect(flagNames).deep.equal(['aaANON', 'aaSUB', 'aaBOTH', 'aa']);
		});
	});
	it('should pass all anonymous test flags', function() {
		setAB(req, res, function() {
			var flagNames = getFlagNames(res.locals.tests.anonymousTests);
			expect(flagNames).deep.equal(['aaANON', 'aaBOTH', 'aa']);
		});
	});
	it('should pass all subscriber test flags', function() {
		setAB(req, res, function() {
			var flagNames = getFlagNames(res.locals.tests.subscriberTests);
			expect(flagNames).deep.equal(['aaSUB', 'aaBOTH', 'aa']);
		});
	});
});
