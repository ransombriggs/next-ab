/*global describe, it, before */
"use strict";

var request = require('supertest');
var app = require('../app');

// Adam Braimbridge's session token
var testSessionToken = 'z0Rby_ft20e007iG3BlHNKqHzwAAAU61sW50ww.MEUCIGnSw7x9WQCpxzWfynq6H50HhClh5qKWbDtvCQoGsrH4AiEAlCNGiRBY_QzAY4vgvyGxZlCuXEyp65MFmVHkKkmjo4U';

describe('Cache test: App request', function() {
	before(function(done) {
		app.listen.then(done.bind(this, undefined));
	});
	it("should receive an appropriate cache header (subscribed users)", function(done){
		request(app)
			.get('/whatever/we/want')
			.set('X-FT-Session-Token', testSessionToken)
			.expect('cache-control', /no-cache/)
			.expect(200, done);
	});
	it("should receive an appropriate cache header (anonymous users)", function(done){
		request(app)
			.get('/whatever/we/want')
			.set('X-FT-Anonymous-User', 'true')
			.expect('cache-control', /no-cache/)
			.expect(200, done);
	});
});
