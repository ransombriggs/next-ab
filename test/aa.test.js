/*global describe, it, before */
"use strict";

var request = require('supertest');
var app = require('../app');

// Adam Braimbridge's session token
var testSessionToken = 'z0Rby_ft20e007iG3BlHNKqHzwAAAU61sW50ww.MEUCIGnSw7x9WQCpxzWfynq6H50HhClh5qKWbDtvCQoGsrH4AiEAlCNGiRBY_QzAY4vgvyGxZlCuXEyp65MFmVHkKkmjo4U';

// The "X-FT-AB" header should include either "aa:on" or "aa:off",
// as well as allocations for any other A/B tests.
// See: next-ab/models/tests.js
describe('AA Tests: App requests', function() {
	before(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	// Subscribed users have an "X-FT-Session-Token" header.
	// The test session token used here happens to resolve to "on".
	// (To test that it resolves to "off", we'll need to find another test session token.)
	it('should set an "aa:on" flag (subscribed users)', function(done) {
		request(app)
			.get('/aa')
			.set('X-FT-Session-Token', testSessionToken)
			.expect('X-FT-AB', /aa:on/)
			.expect(200, done);
	});

	// Anonymous users have an "X-FT-Anonymous-User" header.
	// At time of writing, because the code doesn't have access to a consistent device ID,
	// It generates a new device ID at random each time, so it resolves to either
	// aa:on or aa:off at random.
	it('should set either an "aa:on" or an "aa:off" flag (anonymous users)', function(done) {
		request(app)
			.get('/aa')
			.set('X-FT-Anonymous-User', 'true')
			.expect('X-FT-AB', /aa:(on|off)/)
			.expect(200, done);
	});

});
