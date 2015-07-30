"use strict";

var tests		= require('../models/tests');
var seedrandom	= require('seedrandom');
var debug		= require('debug')('next-ab');
var Metrics		= require('ft-next-express').metrics;
require('es6-promise').polyfill();

module.exports = function(req, res, next) {


	// FIXME the flow I think is something like this

	var uuid = req.header['ft-user-id'] || req.header['x-ft-user-id'];
	var session = req.header['ft-session'] || req.header['x-ft-session'];
	var isAnonymous = req.headers['ft-anonymous-user'];

	if (uuid) {

		return allocate(uuid, tests);	// where 'allocate' is server/utils/allocation.js

	} else if (session) {

		return allocate(session, tests);

	} else if (isAnonymous) {

		return allocate(generateDeviceId(), tests);

	} else {

		return allocate(undefined, tests); // i.e., always allocated to '-' group

	}





	// check for both new and deprecated headers for now
	var sessionToken = req.get('FT-Session-Token') || req.get('X-FT-Session-Token');
	res.set('Vary', 'FT-Session-Token');
	res.set('cache-control', 'private, no-cache, max-age=0');

	function noAB() {
		res.setHeader('x-ft-ab', '-');
		res.sendStatus(200).end();
		return;
	}

	debug('request headers: %s', JSON.stringify(req.headers));

	// FIXME diagnostics
	if (req.get('ft-preflight-request')) {
		Metrics.count('preflight.found.header');
			if (sessionToken) {
				Metrics.count('preflight.found.session_found');
			} else {
				Metrics.count('preflight.found.session_missing');
			}
		} else {		// beacon presumably
			Metrics.count('preflight.missing.header');
			if (sessionToken) {
				Metrics.count('preflight.missing.session_found');
			} else {
				Metrics.count('preflight.missing.session_missing');
			}
		}

	debug('session token: %s', JSON.stringify(sessionToken));

	if(!sessionToken){
		// Presently we don't segment non-signed out users
		Metrics.count('erights.not-found'); // keep this for backwards compatibility
		Metrics.count('sessionToken.not-found');
		debug('No Session Token Found');
		return noAB();
	}

	delete req.headers['host'];
	fetch('https://session-next.ft.com/uuid', {
			headers: req.headers
	}).then(function(response){

		if(!response.ok){
			Metrics.count('uuid.not-found');
			debug('No uuid found');
			return {};
		}

		return response.json();

	}).then(function(json){

		if (json.uuid) {
			var userID = json.uuid;
			debug('UUID is %s', userID);
			var allocation = tests.map(function (test) {
				var rng = seedrandom(userID + test.flag);
				var group = (rng() > 0.5) ? 'off' : 'on';
				return test.flag + ':' + group;
			});

			res.setHeader('x-ft-ab', allocation.join(','));
			res.sendStatus(200).end();

			// See the test allocation in graphite
			allocation.forEach(function (test) {
				Metrics.count(test.replace(/:/g, '.'));
			});

			//debug('Found an eRights ID');
			//debug(res._headers);
			Metrics.count('erights.found');

		} else {
			noAB();
		}

	})
	.catch(function(err) {
		debug('error extracting ab segment from session', err);
		return noAB();
	})
	.catch(next);
};