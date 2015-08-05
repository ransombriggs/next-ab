/* global beforeEach, describe, it, console */

'use strict';

var app		= require('../../server/app');
var expect	= require('chai').expect;
var util	= require('util');
var debug	= require('debug')('ab');

var err = function (err) {
	console.error(err, err.stack);
};

var host = util.format('http://%s', process.env.TEST_APP || 'localhost:5101');

debug('Running tests on host: %s', host);

describe('API', function () {

	beforeEach(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

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
				expect(res[0].name).to.equal('aa');
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
