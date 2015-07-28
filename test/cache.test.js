/*global describe, it, before */
"use strict";

var request = require('supertest');
var app = require('../app');

describe('Cache test: App request', function() {
	before(function(done) {
		app.listen.then(done.bind(this, undefined));
	});
	it("should receive an appropriate cache header", function(done){
		request(app)
			.get('/whatever/we/want')
			.expect('cache-control', /no-cache/)
			.expect(200, done);
	});
});
