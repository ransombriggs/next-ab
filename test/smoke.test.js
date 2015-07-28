/*global describe, it, before*/
"use strict";

var request = require('supertest');
var app = require('../app');


describe('smoke tests for the app', function() {

	before(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	it("Should serve a __gtg page", function(done) {
		request(app)
			.get('/__gtg')
			.expect(200, done);
	});

	it("Should serve a list of tests at __tests", function(done) {
		request(app)
			.get('/__tests')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

});
