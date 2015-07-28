/*global describe, it, before*/
"use strict";

var request = require('supertest');
var app = require('../app');


describe('Smoke tests: The app', function() {

	before(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	it("should serve a __gtg page", function(done) {
		request(app)
			.get('/__gtg')
			.expect(200, done);
	});

	it("should serve a list of tests at __tests", function(done) {
		request(app)
			.get('/__tests')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

});
