/*global describe, it, before */
"use strict";

var request = require('supertest');
var app = require('../app');
var examples = [
	{
		id: "1",
		expectedHeaderValue: /aa:on/
	},
	{
		id: "2",
		expectedHeaderValue: /aa:off/
	}
];

describe('AA test', function() {
	before(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	it("should set appropriate cache headers", function(done){
		request(app)
			.get('/whatever/we/want')
			.set('X-FT-User-Id', 1)
			.expect('cache-control', /no-cache/)
			.expect(200, done);
	});

	// The "x-ft-ab" header refers to the "aa" flag in models/tests.js
	examples.forEach(function(row){

		// Subscribed users have a "x-ft-user-id" header
		it("should allocate subscribed users to the correct AB group", function(done) {
			request(app)
				.get('/aa')
				.set('x-ft-user-id', row.id)
				.expect('x-ft-ab', row.expectedHeaderValue)
				.expect(200, done);
		});

		// Anonymous users have a "x-ft-device-id" header
		it("should allocate anonymous users to the correct AB group", function(done) {
			request(app)
				.get('/aa')
				.set('x-ft-device-id', row.id)
				.expect('x-ft-ab', row.expectedHeaderValue)
				.expect(200, done);
		});

	});
});
