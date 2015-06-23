/*global describe, it, before, xit*/
"use strict";

var request = require('supertest');
var app = require('../app');

describe('ab tests', function() {

	before(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	it("Should serve a list of tests a __tests", function(done) {
		request(app)
			.get('/__tests')
			.expect(200, done);
	});

	it("Allocate users to a control group", function(done) {
		request(app)
			.get('/whatever/we/want')
			.set('X-FT-User-Id', 1)
			.expect(function (res) {
				var allocation = res.headers['x-ft-ab'];
				var cacheControl = res.headers['cache-control'];
				var expectation = /aa:on/;

				if (!expectation.test(allocation)) {
					throw 'Allocation ' + allocation + ' does not match ' + expectation;
				}

				if (cacheControl !== 'no-cache') {
					throw 'Expected "no-cache" headers';
				}

			})
			.expect(200, done);
	});

	xit("Ignore users with no eRights", function(done) {
		request(app)
			.get('/ab')
			.expect(200, done);
	});

});
