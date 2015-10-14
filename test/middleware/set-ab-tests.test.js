/* global describe, it */

'use strict';

const setAB = require('../../server/middleware/set-ab-tests');
const expect = require('chai').expect;
const req = {};
const res = {
	locals : {
		flagsArray: [
		{
			'name': 'aaANON',
			'description': 'An A/A test is an experiment where the two alternatives are exactly the same. This helps to calibrate the A/B test tool.',
			'owner': 'matt.chadburn@ft.com',
			'safeSate': false,
			'state': false,
			'tags': [
				'calibration',
				'tool',
				'next-ab'
			],
			'expiry': '2030-01-01T00:00:00.000Z',
			'abTestState': true,
			'cohorts': [
				'anonymous'
			]
		},
		{
			'name': 'aaSUB',
			'description': 'An A/A test is an experiment where the two alternatives are exactly the same. This helps to calibrate the A/B test tool.',
			'owner': 'matt.chadburn@ft.com',
			'safeSate': false,
			'state': false,
			'tags': [
				'calibration',
				'tool',
				'next-ab'
			],
			'expiry': '2030-01-01T00:00:00.000Z',
			'abTestState': true,
			'cohorts': [
				'subscriber'
			]
		},
		{
			'name': 'aaBOTH',
			'description': 'An A/A test is an experiment where the two alternatives are exactly the same. This helps to calibrate the A/B test tool.',
			'owner': 'matt.chadburn@ft.com',
			'safeSate': false,
			'state': false,
			'tags': [
				'calibration',
				'tool',
				'next-ab'
			],
			'expiry': '2030-01-01T00:00:00.000Z',
			'abTestState': true,
			'cohorts': [
				'subscriber',
				'anonymous'
			]
		},
		{
			'name': 'aa',
			'description': 'An A/A test is an experiment where the two alternatives are exactly the same. This helps to calibrate the A/B test tool.',
			'owner': 'matt.chadburn@ft.com',
			'safeSate': false,
			'state': false,
			'tags': [
				'calibration',
				'tool',
				'next-ab'
			],
			'expiry': '2030-01-01T00:00:00.000Z',
			'cohorts': [],
			'abTestState': true
		},
		{
			'name': 'NOTaa',
			'description': 'An A/A test is an experiment where the two alternatives are exactly the same. This helps to calibrate the A/B test tool.',
			'owner': 'matt.chadburn@ft.com',
			'safeSate': false,
			'state': false,
			'tags': [
				'calibration',
				'tool',
				'next-ab'
			],
			'expiry': '2030-01-01T00:00:00.000Z',
		}
		]
	}
};

const getFlagNames = function (flags) {
	return flags.map(function(flag) {
		return flag.name;
	});
};

describe('Set AB tests middleware', function() {
	it('should pass all ab test flags', function() {
		setAB(req, res, function() {
			let flagNames = getFlagNames(res.locals.tests.flagsWithABTests);
			expect(flagNames).deep.equal(['aaANON', 'aaSUB', 'aaBOTH', 'aa']);
		});
	});
	it('should pass all anonymous test flags', function() {
		setAB(req, res, function() {
			let flagNames = getFlagNames(res.locals.tests.anonymousTests);
			expect(flagNames).deep.equal(['aaANON', 'aaBOTH']);
		});
	});
	it('should pass all subscriber test flags', function() {
		setAB(req, res, function() {
			let flagNames = getFlagNames(res.locals.tests.subscriberTests);
			expect(flagNames).deep.equal(['aaSUB', 'aaBOTH']);
		});
	});
});
