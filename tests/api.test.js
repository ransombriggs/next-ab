/* global beforeEach, describe, it, console */

'use strict';

var app = require('../server/app');
var expect = require('chai').expect;

var err = function (err) {
	console.error(err, err.stack);
};

describe('A/B allocation API', function () {

	beforeEach(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	// Smoke test
	it('should respond to a good-to-go end point', function (done) {
		fetch('http://localhost:5101/__gtg')
			.then(function (res) {
				expect(res.status).to.equal(200);
				done();
			}).catch(err);
	});

	// Case: "ft-user-id" header is provided
	// e.g. curl -H 'ft-user-id: ...' ft-next-ab.herokuapp.com/foo
	it.skip('should return an x-ft-ab header based on a user\'s uuid', function (done) {
		fetch('http://localhost:5101/foo', {
			headers: {
				'ft-user-id': 'abc-123'
			}
		})
		.then(function (res) {
			expect(res.status).to.equal(200);
			done();
		}).catch(err);
	});

	// Case: "ft-session-token" header is provided
	// e.g. curl -H 'ft-session-token: ...' ft-next-ab.herokuapp.com/foo
	it.skip('should return an x-ft-ab header based on a user\'s uuid derived from their session token', function (done) {
		fetch('http://localhost:5101/foo', {
			headers: {
				'ft-session-token': 'abc-123'
			}
		})
		.then(function (res) {
			expect(res.status).to.equal(200);
			done();
		}).catch(err);
	});

	// Case: "ft-anonymous-user" header is provided
	// (boolean; set if it detects no valid session)
	// e.g. curl -H 'ft-anonymous-user: true' ft-next-ab.herokuapp.com/foo
	it.skip('should return an x-ft-ab header based on an anonymous user\'s (generated) device id', function (done) {
		fetch('http://localhost:5101/foo', {
			headers: {
				'ft-anonymous-user': 'true'
			}
		})
		.then(function (res) {
			expect(res.status).to.equal(200);
			done();
		}).catch(err);
	});

	// Case: "ft-device-id" header is provided
	// e.g. curl -H 'ft-device-id: ...' ft-next-ab.herokuapp.com/foo
	it.skip('should return an x-ft-ab header based on a user\'s device id', function (done) {
		fetch('http://localhost:5101/foo', {
			headers: {
				'ft-device-id': 'abc-123'
			}
		})
		.then(function (res) {
			expect(res.status).to.equal(200);
			done();
		}).catch(err);
	});

	// Case: "ft-session-api-fail" header is provided
	//  ... user is possibly signed in, but preflight / session validation failed (http 5xx)
	// e.g. curl -H 'ft-session-api-fail: true' ft-next-ab.herokuapp.com/foo
	it('should return a blank x-ft-ab header to requests that failed preflight session validation', function (done) {
		return fetch('http://localhost:5101/foo', {
			headers: {
				'ft-preflight-session-failure': 'true' // FIXME: needs adding to CDN
			}
		})
		.then(function (res) {
			expect(res.status).to.equal(200);
			expect(res.headers.get('x-ft-ab')).to.equal('-');
			done();
		}).catch(err);
	});

	// Case: no header was provided
	// e.g. curl ft-next-ab.herokuapp.com/foo
	it('should return a blank x-ft-ab header to requests that provide no headers', function (done) {
		fetch('http://localhost:5101/foo')
			.then(function (res) {
				expect(res.status).to.equal(200);
				expect(res.headers.get('x-ft-ab')).to.equal('-');
				done();
			}).catch(err);
	});
});
