/* global beforeEach, describe, it, console */

'use strict';

var app		= require('../app');
var expect	= require('chai').expect;

require('node-fetch');

var err = function (err) {
	console.error(err, err.stack);
};

describe('A/B segmentation API', function () {

	beforeEach(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	it("Should serve a list of tests a __tests", function(done) {
		fetch('http://localhost:5101/__tests')
			.then(function (res) {
				expect(res.status).to.equal(200);
				done();
			}).catch(err);
	});

	it('Respond to a good-to-go end point', function (done) {
		fetch('http://localhost:5101/__gtg')
			.then(function (res) {
				expect(res.status).to.equal(200);
				done();
			}).catch(err);
	});

	it('Refuse to segment a client that does not send any headers', function (done) {
		fetch('http://localhost:5101/foo')
			.then(function (res) {
				expect(res.status).to.equal(200);
				expect(res.headers.get('x-ft-ab')).to.equal('-');
				done();
			}).catch(err);
	});

	// Eg, user looks signed in but preflight / session validation fails (http 5xx)
	it.skip('Refuse to segment a client that does not send any headers', function (done) {
		fetch('http://localhost:5101/foo', {
				headers: {
					'ft-preflight-session-failure': true	// FIXME needs adding to CDN
				}
			})
			.then(function (res) {
				expect(res.status).to.equal(200);
				expect(res.headers.get('x-ft-ab')).to.equal('-');
				done();
			}).catch(err);
	});

	// Eg, preflight detects no valid session
	it('Segment anonymous users based on a (temporary) generated device identifier', function (done) {
		fetch('http://localhost:5101/foo', {
				headers: {
					'ft-anonymous-user': true
				}
			})
			.then(function (res) {
				expect(res.status).to.equal(200);
				expect(res.headers.get('x-ft-ab')).to.equal('-');
				done();
			}).catch(err);
	});

	// Eg. call session-next.ft.com/uuid and grab the UUID
	it('Segment on a user\'s GUID derived from their session token.', function (done) {
		fetch('http://localhost:5101/foo', {
				headers: {
					'ft-session': '123'
				}
			})
			.then(function (res) {
				expect(res.status).to.equal(200);
				expect(res.headers.get('x-ft-ab')).to.equal('-');
				done();
			}).catch(err);
	});

	it('Segment users by a given GUID', function (done) {
		fetch('http://localhost:5101/foo', {
				headers: {
					'ft-user-id': '1'
				}
			})
			.then(function (res) {
				expect(res.status).to.equal(200);
				expect(res.headers.get('x-ft-ab')).to.equal('aa:on');
				done();
			}).catch(err);
	});

	it('Segment users by a given device ID', function (done) {
		fetch('http://localhost:5101/foo', {
				headers: {
					'ft-user-id': '123-123-123'
				}
			})
			.then(function (res) {
				expect(res.status).to.equal(200);
				expect(res.headers.get('x-ft-ab')).to.equal('-');
				done();
			}).catch(err);
	});

});
