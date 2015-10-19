/* global describe, it */

'use strict';

const allocate = require('../server/allocate');
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

const user = {uuid: 'd3fe0b06-9e43-11e3-b429-00144feab7de'};

describe('Allocate', function () {

	it('Should not allocate users if there are no defined tests', function () {
		expect(allocate(undefined, user)).to.equal(false);
	});

	it('Should not allocate users if there are no active tests', function () {
		expect(allocate({flagsWithABTests: []}, user)).to.equal(false);
	});

	it('Should not allocate users if the allocation id is not defined', function () {
		expect(allocate({
			flagsWithABTests: [test_1, test_2],
			anonymousTests: [test_1, test_2]
		}, undefined)).to.equal(false);
	});

	it('Should allocate a user to a single test', function () {
		expect(allocate({
			flagsWithABTests: [test_1],
			anonymousTests: [test_1]
		}, user)).to.deep.equal('foo:off');
	});

	it('Should allocate a user to multiple tests', function () {
		expect(allocate({
			flagsWithABTests: [test_1, test_2, test_3],
			anonymousTests: [test_1, test_2, test_3]
		}, {uuid: 'n3fe0b06-9e43-11e3-b429-00144feab7de'})).to.deep.equal('foo:on,boo:off,coo:off');
		expect(allocate({
			flagsWithABTests: [test_1, test_2],
			anonymousTests: [test_1, test_2]
		}, {uuid: 'a3fe0b06-9e43-11e3-b429-00144feab7de'})).to.deep.equal('foo:on,boo:on');
	});
	
	it('should only allocate an anonymous user to the anonymous tests', function() {
		expect(allocate({
			flagsWithABTests: [test_1, test_2, test_4, test_5],
			anonymousTests: [test_1, test_4],
			subscriberTests: [test_2, test_5]
		}, {uuid: 'n3fe0b06-9e43-11e3-b429-00144feab7de'})).to.deep.equal('foo:on,ANONonly:off');
	});
	
	it('should only allocate a subscriber to the subscriber tests', function() {
		expect(allocate({
			flagsWithABTests: [test_1, test_2, test_4, test_5],
			anonymousTests: [test_1, test_4],
			subscriberTests: [test_2, test_5]
		}, {uuid: 'n3fe0b06-9e43-11e3-b429-00144feab7de', isSubscriber: true})).to.deep.equal('boo:off,SUBonly:off');
	});

	it('Should allocate the tests within the users range', function () {
		expect(allocate({
			flagsWithABTests: [test_6, test_7],
			anonymousTests: [test_6, test_7]
		}, user)).to.deep.equal('InRangeA:off');

		expect(allocate({
			flagsWithABTests: [test_6, test_7],
			anonymousTests: [test_6, test_7]
		}, {uuid: 'a3fe0b06-9e43-11e3-b429-00144feab7de'})).to.deep.equal('InRangeB:off');
	});

	it('Should not allocate tests with bad ranges', function () {
		expect(allocate({
			flagsWithABTests: [test_8],
			anonymousTests: [test_8]
		}, user)).to.equal('');
	});
});
