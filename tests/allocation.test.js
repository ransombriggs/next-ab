/* global beforeEach, describe, it, console */

'use strict';

var allocation = require('../server/middleware/set-allocation-id');
var mitm = require('mitm');
var expect = require('chai').expect;

var err = function (err) {
	console.error(err, err.stack);
};

describe('Allocation', function () {

	beforeEach(function(done) {
		this.mitm = mitm();
		this.mitm.on('request', function(req, res) {
			console.log('mocked request', req.url);
		});
	});

	it('NO SESSION. should return an x-ft-ab header based on an anonymous user\'s (generated) device id', function (done) {
	});

});
