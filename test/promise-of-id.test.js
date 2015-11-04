/* global beforeEach, afterEach, describe, it */

'use strict';

const promiseOfId	= require('../server/promise-of-id');
const expect = require('chai').expect;
const mitm = require('mitm');
const sinon = require('sinon');

const uuidv3 = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

describe('Promise of ID', function () {

	beforeEach(function() {
		this.mitm = mitm();
	});

	afterEach(function() {
		this.mitm.disable();
	});

	it('Should derive a UUID from the session token', function (done) {

		this.mitm.on('request', function(req, res) {
			if (req.url === '/membership/sessions/z3MN_fJbrEOi07YfudMM2Trlzw') {
				res.statusCode = 200;
				res.end('{"uuid":"de305d54-75b4-431b-adb2-eb6b9e546014","creationTime": 1446633501488,"rememberMe": true}');
			}
		});

		const get = sinon.stub();
		get.withArgs('ft-session-token').returns('z3MN_fJbrEOi07YfudMM2Trlzw');

		const req = {
			get: get
		};

		promiseOfId(req)
			.then(function (user) {
				expect(user.uuid).to.equal('de305d54-75b4-431b-adb2-eb6b9e546014');
				done();
			});
	});

	it('Should catch invalid session errors from the Session API', function (done) {

		this.mitm.on('request', function(req, res) {
			res.statusCode = 404;
			res.end();
		});

		const req = {
			get: sinon.stub().returns('z3MN_fJbrEOi07YfudMM2Trlzw')
		};

		promiseOfId(req)
			.catch(function (err) {
				expect(err.message).to.equal('Invalid session');
				done();
			});
	});

	it('Should use device id when specified in the header', function (done) {

		const get = sinon.stub();
		get.withArgs('ft-allocation-id').returns('f5b634a6-e5c3-46a7-b6c8-129d8e0cd3ef');

		const req = {
			get: get
		};

		promiseOfId(req)
			.then(function (user) {
				expect(user.uuid).to.equal('f5b634a6-e5c3-46a7-b6c8-129d8e0cd3ef');
				done();
			});

	});

	it('Should generate a UUID when neither a session or device-id are specified', function (done) {

		const req = {
			get: sinon.stub()
		};

		promiseOfId(req)
			.then(function (user) {
				expect(user.uuid).to.match(uuidv3);
				done();
			});
	});

});
