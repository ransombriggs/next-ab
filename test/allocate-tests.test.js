/* global describe, it */

'use strict';

const allocate = require('../server/lib/allocate-tests');
const expect = require('chai').expect;

// Note: These are AB tests, not unit tests.
const test_1 = { name: 'foo', abTestSetup: {offset:0, range: 100} };
const test_2 = { name: 'boo', abTestSetup: {offset:0, range: 100} };
const test_3 = { name: 'coo', abTestSetup: {offset:0, range: 100} };
const test_4 = { name: 'ANONonly', abTestSetup: {offset:0, range: 100} };
const test_5 = { name: 'SUBonly', abTestSetup: {offset:0, range: 100} };
const test_6 = { name: 'InRangeA', abTestSetup: {offset:90, range: 10} };
const test_7 = { name: 'InRangeB', abTestSetup: {offset:10, range: 30} };
const test_8 = { name: 'BadRange', abTestSetup: {offset:0, range: 110} };
const mvt = { name: 'mvt', abTestSetup: {offset:0, range: 100, variants: ['variant1', 'variant2']} };

const user = {uuid: 'd3fe0b06-9e43-11e3-b429-00144feab7de'};

describe('Allocate', function () {

	it('Should not allocate users if there are no defined tests', function () {
		expect(allocate(undefined, user)).to.equal(false);
	});

	it('Should not allocate users if there are no active tests', function () {
		expect(allocate({flagsWithABTests: []}, user)).to.equal(false);
	});

	it('Should allocate a user to a single test', function () {
		expect(allocate({
			flagsWithABTests: [test_1],
			anonymousTests: [test_1]
		}, user)).to.deep.equal('foo:control');
	});

	it('Should allocate a user to multiple tests', function () {
		expect(allocate({
			flagsWithABTests: [test_1, test_2, test_3],
			anonymousTests: [test_1, test_2, test_3]
		}, {uuid: 'n3fe0b06-9e43-11e3-b429-00144feab7de'})).to.deep.equal('foo:variant,boo:control,coo:control');
		expect(allocate({
			flagsWithABTests: [test_1, test_2],
			anonymousTests: [test_1, test_2]
		}, {uuid: 'a3fe0b06-9e43-11e3-b429-00144feab7de'})).to.deep.equal('foo:variant,boo:variant');
	});

	it('should only allocate an anonymous user to the anonymous tests', function() {
		expect(allocate({
			flagsWithABTests: [test_1, test_2, test_4, test_5],
			anonymousTests: [test_1, test_4],
			subscriberTests: [test_2, test_5]
		}, {uuid: 'n3fe0b06-9e43-11e3-b429-00144feab7de'})).to.deep.equal('foo:variant,ANONonly:control');
	});

	it('should only allocate a subscriber to the subscriber tests', function() {
		expect(allocate({
			flagsWithABTests: [test_1, test_2, test_4, test_5],
			anonymousTests: [test_1, test_4],
			subscriberTests: [test_2, test_5]
		}, {uuid: 'n3fe0b06-9e43-11e3-b429-00144feab7de', isSubscriber: true})).to.deep.equal('boo:control,SUBonly:control');
	});

	it('Should allocate the tests within the users range', function () {
		expect(allocate({
			flagsWithABTests: [test_6, test_7],
			anonymousTests: [test_6, test_7]
		}, user)).to.deep.equal('InRangeA:control');

		expect(allocate({
			flagsWithABTests: [test_6, test_7],
			anonymousTests: [test_6, test_7]
		}, {uuid: 'a3fe0b06-9e43-11e3-b429-00144feab7de'})).to.deep.equal('InRangeB:control');
	});

	it('Should not allocate tests with bad ranges', function () {
		expect(allocate({
			flagsWithABTests: [test_8],
			anonymousTests: [test_8]
		}, user)).to.equal('');
	});

	it('Should allocate multi variant tests', function () {
		// nothing special about the numbers added below, other than that
		// they happen to hit all 3 values of the mvt
		expect(allocate({
			flagsWithABTests: [mvt],
			anonymousTests: [mvt]
		}, {uuid: user.uuid})).to.equal('mvt:control');
		expect(allocate({
			flagsWithABTests: [mvt],
			anonymousTests: [mvt]
		}, {uuid: user.uuid + 1})).to.equal('mvt:variant2');
		expect(allocate({
			flagsWithABTests: [mvt],
			anonymousTests: [mvt]
		}, {uuid: user.uuid + 6})).to.equal('mvt:variant1');
	});

});
