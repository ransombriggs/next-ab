/*global describe, it, before*/
"use strict";

var request = require('supertest');
var app = require('../app');

describe('ab tests', function() {

	before(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	it("Allocate users to a control group", function(done) {
		request(app)
			.get('/ab')
			.set('X-FT-User-Id', 1)
			.expect(function (res) {
				var a = res.headers['set-cookie'];
				if (!/next-ab=aa%3Acontrol%2Cab%3Acontrol/.test(a)) {
					throw a + ' did not meet expectation';
				}
			})
			.expect(302, done);
	});

});
