/* global beforeEach, describe, it, console */

'use strict';

var app = require('../server/app');
var expect = require('chai').expect;

// Adam Braimbridge's session token
// TODO: This will break once the session expires. Find a solution.
var testSessionToken = 'z0Rby_ft20e007iG3BlHNKqHzwAAAU61sW50ww.MEUCIGnSw7x9WQCpxzWfynq6H50HhClh5qKWbDtvCQoGsrH4AiEAlCNGiRBY_QzAY4vgvyGxZlCuXEyp65MFmVHkKkmjo4U';

var err = function (err) {
	console.error(err, err.stack);
};

describe('A/B allocation API', function () {

	beforeEach(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	// Smoke test: __gtg endpoint
	it('should respond to a good-to-go end point', function (done) {
		fetch('http://localhost:5101/__gtg')
			.then(function (res) {
				expect(res.status).to.equal(200);
				done();
			}).catch(err);
	});

	// Smoke test: __tests endpoint
	it('should respond to a __tests end point', function (done) {
		fetch('http://localhost:5101/__tests')
			.then(function (res) {
				expect(res.status).to.equal(200);
				return res.json();
			})
			.then(function (res) {
				expect(res[0].name).to.equal('aa');
				done();
			}).catch(err);
	});

	// Case: "ft-session-token" header is provided
	// e.g. curl -H 'ft-session-token: ...' ft-next-ab.herokuapp.com/foo
	it('should return an x-ft-ab header based on a user\'s uuid derived from their session token', function (done) {
		fetch('http://localhost:5101/foo', {
			headers: {
				'ft-session-token': testSessionToken
			}
		})
		.then(function (res) {
			expect(res.headers.get('x-ft-ab')).to.match(/aa:(on|off)/);
			done();
		}).catch(err);
	});

	// Case: "ft-device-id" header is provided
	// e.g. curl -H 'ft-device-id: ...' ft-next-ab.herokuapp.com/foo
	it('should return an x-ft-ab header based on a user\'s device id', function (done) {
		fetch('http://localhost:5101/foo', {
			headers: {
				'ft-device-id': 'abc-123'
			}
		})
		.then(function (res) {
			expect(res.headers.get('x-ft-ab')).to.match(/aa:(on|off)/);
			done();
		}).catch(err);
	});

	it('INVALID SESSION. should return an x-ft-ab header based on an anonymous user\'s (generated) device id', function (done) {
		fetch('http://localhost:5101/foo', {
			headers: {
				'ft-session-token': 'this-is-an-invalid-session'
			}
		})
		.then(function (res) {
			expect(res.headers.get('x-ft-ab')).to.equal('-');
			done();
		}).catch(err);
	});

	it('NO SESSION. should return an x-ft-ab header based on an anonymous user\'s (generated) device id', function (done) {
		fetch('http://localhost:5101/foo', {
			headers: { }
		})
		.then(function (res) {
			expect(res.headers.get('x-ft-ab')).to.match(/aa:(on|off)/);
			expect(res.headers.get('x-device-id')).to.equal('....');
			done();
		}).catch(err);
	});

});
