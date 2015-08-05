/* global describe, it */

'use strict';

var allocate = require('../../server/allocate');
var expect = require('chai').expect;

// Note: These are AB tests, not unit tests.
var test_1 = { name: 'foo' };
var test_2 = { name: 'boo' };
var test_3 = { name: 'coo' };

describe('Allocate', function () {

	it('Should not allocate users if there are no defined tests', function () {
		expect(allocate(undefined, 'd3fe0b06-9e43-11e3-b429-00144feab7de')).to.equal(false);
	});

	it('Should not allocate users if there are no active tests', function () {
		expect(allocate([], 'd3fe0b06-9e43-11e3-b429-00144feab7de')).to.equal(false);
	});

	it('Should not allocate users if the allocation id is not defined', function () {
		expect(allocate([test_1, test_2], undefined)).to.equal(false);
	});

	it('Should allocate a user to a single test', function () {
		expect(allocate([test_1], 'd3fe0b06-9e43-11e3-b429-00144feab7de')).to.deep.equal('foo:off');
	});

	it('Should allocate a user to multiple tests', function () {
		expect(allocate([test_1, test_2, test_3], 'n3fe0b06-9e43-11e3-b429-00144feab7de')).to.deep.equal('foo:on,boo:off,coo:off');
		expect(allocate([test_1, test_2], 'a3fe0b06-9e43-11e3-b429-00144feab7de')).to.deep.equal('foo:on,boo:on');
	});

});