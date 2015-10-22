/* global beforeEach, describe, it, console */

'use strict';
require('isomorphic-fetch');
let host;
let app;
if (process.env.AMMIT_HOST) {
	host = process.env.AMMIT_HOST;
} else {
	app = require('../server/app');
	host = 'http://localhost:5101';
}

const expect = require('chai').expect;

const err = function (err) {
	console.error(err, err.stack);
};

describe('API', function () {
	if (!process.env.AMMIT_HOST) {
		before(function(done) {
			app.listen.then(done.bind(this, undefined));
		});
	}

	it('Should be good-to-go', function (done) {
		fetch(host + '/__gtg')
			.then(function (res) {
				expect(res.status).to.equal(200);
				done();
			}).catch(err);
	});

	it('Should display a list of active AB tests', function (done) {
		fetch(host + '/__tests')
			.then(function (res) {
				expect(res.status).to.equal(200);
				return res.json();
			})
			.then(function (res) {
				expect(res.flagsWithABTests[0].name).to.equal('aa');
				done();
			}).catch(err);
	});

	it('Should return an x-ft-ab header based on a user\'s device id', function (done) {
		fetch(host + '/foo', {
			headers: {
				'ft-allocation-id': 'abc-123'
			}
		})
		.then(function (res) {
			expect(res.headers.get('x-ft-ab')).to.match(/aa:(on|off)/);
			expect(res.headers.get('ft-allocation-id')).to.equal('abc-123');
			done();
		}).catch(err);
	});

	it('should set appropriate cache headers', function (done) {
		fetch(host + '/palamapalamapalam')
			.then(function (res) {
				if (process.env.AMMIT_HOST) {
					expect(res.headers.get('cache-control')).to.equal('private, max-age=0, no-cache');
				} else {
					expect(res.headers.get('cache-control')).to.equal('max-age=3600, public, stale-while-revalidate=3600, stale-if-error=86400');
					expect(res.headers.get('outbound-cache-control')).to.equal('private, max-age=0, no-cache');
				}
				done();
			}).catch(err);
	});

	it('Invalid sessions should not be segmented', function (done) {
		fetch(host + '/foo', {
			headers: {
				'ft-session-token': 'this-is-an-invalid-session'
			}
		})
		.then(function (res) {
			expect(res.headers.get('x-ft-ab')).to.equal('-');
			expect(res.headers.get('ft-allocation-id')).to.equal(null);
			done();
		}).catch(err);
	});



});
