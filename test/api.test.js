/* global beforeEach, describe, it, console */

'use strict';

var app = require('../server/app');
var expect = require('chai').expect;

var err = function (err) {
	console.error(err, err.stack);
};

describe('API', function () {

	beforeEach(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	it('Should be good-to-go', function (done) {
		fetch('http://localhost:5101/__gtg')
			.then(function (res) {
				expect(res.status).to.equal(200);
				done();
			}).catch(err);
	});

	it.skip('Should display a list of active AB tests', function (done) {
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

	it.skip('Should return an x-ft-ab header based on a user\'s device id', function (done) {
		fetch('http://localhost:5101/foo', {
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
		fetch('http://localhost:5101/foo', {
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
