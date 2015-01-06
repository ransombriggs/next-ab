/*global describe, it, before*/
"use strict";

var request = require('supertest');
var app = require('../app');


describe('ab tests', function() {

	before(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	it("Put me in a stickyNavigation on group", function(done) {
		request(app)
			.get('/ab')
			.set('X-FT-User-Id', 8329130)
			.expect('set-cookie', /next-ab=stickyNavigation%3Aon; Path=\/; Expires=.+/)
			.expect(302, done);
	});

	it("Put me in a stickyNavigation off group", function(done) {
		request(app)
			.get('/ab')
			.set('X-FT-User-Id', 8329131)
			.expect('set-cookie', /next-ab=stickyNavigation%3Aoff; Path=\/; Expires=.+/)
			.expect(302, done);
	});

	it("Put me in a stickyNavigation not in test group", function(done) {
		request(app)
			.get('/ab')
			.set('X-FT-User-Id', 8329132)
			.expect('set-cookie', /next-ab=none; Path=\/; Expires=/)
			.expect(302, done);
	});

});
