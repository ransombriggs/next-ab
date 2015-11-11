/* global describe, it */

'use strict';

const setAB = require('../server/middleware/set-ab-tests');
const expect = require('chai').expect;
const req = {};
const res = {
	locals : {
		flagsRaw: require('./fixtures/flags')
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
			expect(flagNames).to.eql(['aa', 'aaa', 'abANON', 'abSUB', 'abBOTH']);
		});
	});
	it('should pass all anonymous test flags', function() {
		setAB(req, res, function() {
			let flagNames = getFlagNames(res.locals.tests.anonymousTests);
			expect(flagNames).to.eql(['aa', 'aaa', 'abANON', 'abBOTH']);
		});
	});
	it('should pass all subscriber test flags', function() {
		setAB(req, res, function() {
			let flagNames = getFlagNames(res.locals.tests.subscriberTests);
			expect(flagNames).to.eql(['aa', 'aaa', 'abSUB', 'abBOTH']);
		});
	});

	it('should limit calibration tests to a subset of users', function () {
		setAB(req, res, function() {
			const aaFlag = res.locals.tests.flagsWithABTests.find(f => f.name === 'aa');
			const aaaFlag = res.locals.tests.flagsWithABTests.find(f => f.name === 'aaa');
			expect(aaFlag.abTestSetup.range).to.equal(5);
			expect(aaaFlag.abTestSetup.range).to.equal(5);
			expect(aaFlag.abTestSetup.offset).to.not.equal(aaaFlag.abTestSetup.offset);
		});
	});
});
