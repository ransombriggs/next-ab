/* global beforeEach, describe, it*/

'use strict';
var sinon = require('sinon');
var expect = require('chai').expect;
var setAllocationHeader = require('../server/middleware/set-allocation-header');
var req = { headers: {}, cookies: {} };
var res = {
	set: sinon.spy(),
	cookie: sinon.spy(),
	locals: {
		tests: [
			{
				name: 'test1',
				abTestState: true
			},
			{
				name: 'test2',
				abTestState: true
			}
		],
		id: '123'
	}
};

var next = sinon.spy();

describe('Set Allocation Header', function () {

	beforeEach(function() {
		res.set.reset();
		res.cookie.reset();
		next.reset();
	});

	it('should set the allocation', function(done) {
		setAllocationHeader(req, res, next);
		expect(res.set.args[0][0]).to.equal('x-ft-ab');
		expect(res.set.args[1][0]).to.equal('ft-allocation-id');
		expect(res.set.args[1][1]).to.equal('123');
		done();
	});

	it('should set a cookie if no allocation id header', function(done) {
		setAllocationHeader(req, res, next);
		expect(res.cookie.args[0][0]).to.equal('FTAllocation');
		done();
	});

	it('should not set the cookie if an allocation header is passed', function(done) {
		req.headers['ft-allocation-id'] = '12345';
		setAllocationHeader(req, res, next);
		expect(res.cookie.called).to.be.false;
		done();
	});

});
