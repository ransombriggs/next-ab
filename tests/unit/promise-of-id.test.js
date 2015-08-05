/* global beforeEach, afterEach, describe, it */

'use strict';

var promiseOfId	= require('../../server/promise-of-id');
var expect		= require('chai').expect;
var mitm		= require('mitm');
var sinon		= require('sinon');

var uuidv3 = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

describe('Promise of ID', function () {

	beforeEach(function() {
		this.mitm = mitm();
	});

	afterEach(function() {
		this.mitm.disable();
	});

	it('Should derive a UUID from the session token', function (done) {

		this.mitm.on("request", function(req, res) {
			if (req.headers['ft-session-token'] === 'z3MN_fJbrEOi07YfudMM2Trlzw') {
				res.statusCode = 200;
				res.end('{"uuid":"de305d54-75b4-431b-adb2-eb6b9e546014"}');
			}
		});

		var get = sinon.stub();
		get.withArgs('ft-session-token').returns('z3MN_fJbrEOi07YfudMM2Trlzw');

		var req = {
			get: get
		};

		promiseOfId(req)
			.then(function (uuid) {
				expect(uuid).to.equal('de305d54-75b4-431b-adb2-eb6b9e546014');
				done();
			});
	});

	it('Should catch invalid session errors from the Session API', function (done) {

		this.mitm.on("request", function(req, res) {
			res.statusCode = 404;
			res.end();
		});

		var req = {
			get: sinon.stub().returns('z3MN_fJbrEOi07YfudMM2Trlzw')
		};

		promiseOfId(req)
			.catch(function (err) {
				expect(err.message).to.equal('Invalid session');
				done();
			});
	});

	it('Should use device id when specified in the header', function (done) {

		var get = sinon.stub();
		get.withArgs('ft-allocation-id').returns('f5b634a6-e5c3-46a7-b6c8-129d8e0cd3ef');

		var req = {
			get: get
		};

		promiseOfId(req)
			.then(function (uuid) {
				expect(uuid).to.equal('f5b634a6-e5c3-46a7-b6c8-129d8e0cd3ef');
				done();
			});

	});

	it('Should generate a UUID when neither a session or device-id are specified', function (done) {

		var req = {
			get: sinon.stub()
		};

		promiseOfId(req)
			.then(function (uuid) {
				expect(uuid).to.match(uuidv3);
				done();
			});
	});

});
