"use strict";

var seedrandom = require('seedrandom');
var debug = require('debug')('next-ab');
var Metrics = require('ft-next-express').metrics;
var uuid = require('node-uuid');
require('es6-promise').polyfill();

// Metrics and debugging
var doDebuggingPaperwork = function(req, res) {
	Metrics.instrument(res, { as: 'express.http.res' });
	Metrics.instrument(req, { as: 'express.http.req' });

	// Check for both new and deprecated headers for now
	// See: http://git.svc.ft.com/projects/NEXT/repos/preflight-requests/browse/src/tasks/session.js
	var sessionToken = req.get('FT-Session-Token') || req.get('X-FT-Session-Token');
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
};

var getABTests = function(flagsArray) {
	var flagsWithABTests = flagsArray.filter(function (flag) {
		return flag.abTestState === true;
	});
	if (!flagsWithABTests || flagsWithABTests.length <= 0) {
		debug("Could not find any feature flags with AB tests");
		return [];
	}
	else {
		return flagsWithABTests;
	}
};

// TODO: The device ID ought to be provided by preflight — assuming that
// all requests go via preflight — and stored as a cookie in the CDN.
// See: http://git.svc.ft.com/projects/NEXT/repos/preflight-requests/browse/src/tasks/session.js
var getDeviceID = function(req, res) {

	var deviceID =
		req.get('FT-Device-ID') ||
		req.headers['FT-Device-ID'] ||
		req.get('X-FT-Device-ID') ||
		req.headers['X-FT-Device-ID'];

	if (!deviceID) {
		debug("Device ID not provided. Generating one at random.");
		deviceID = uuid();
		req.headers['X-FT-Device-ID'] = deviceID;
		res.setHeader('X-FT-Device-ID', deviceID);
	}

	return deviceID;
};

// The allocationID is the ID to be used for AB segmentation
// It can be either the device ID or the user's uuid.
var getAllocationID = function(req, res){

	// TODO: Cast a narrower net here
	// See: http://git.svc.ft.com/projects/NEXT/repos/preflight-requests/browse/src/tasks/session.js
	var isAnonymous =
		req.headers['ft-anonymous-user'] ||
		req.headers['x-ft-anonymous-user'] ||
		req.get('ft-anonymous-user') ||
		req.get('x-ft-anonymous-user');

	if (isAnonymous) {
		return Promise.resolve(getDeviceID(req, res));
	}
	else {

		// Fetch the user's uuid.
		// The headers must include a valid FT session token, provided by preflight.
		// See: http://git.svc.ft.com/projects/NEXT/repos/preflight-requests/browse/src/tasks/session.js
		delete req.headers['host'];
		return fetch('https://session-next.ft.com/uuid', {
			headers: req.headers
		})
		.then(function(response){

			if(!response.ok){
				Metrics.count('uuid.not-found');
				debug('No uuid found');
				return {};
			} else {
				return response.json();
			}
		})
		.then(function(json){
			if (json.uuid) {
				return json.uuid;
			}

			debug("Not anonymous, but didn't find uuid, so getting device ID");
			return getDeviceID(req, res);
		})
		.catch(function(err) {
			debug('Error determining user uuid', err);
		});
	}
};

// Allocate the user into an a/b segment for each test
var getAllocation = function(tests, allocationID){

	debug("allocationID: ",allocationID);

	var allocation = tests.map(function (test) {
		var rng = seedrandom(allocationID + test.name);
		var group = (rng() > 0.5) ? 'off' : 'on';
		return test.name + ':' + group;
	});
	return allocation;
};

module.exports = function(req, res, next) {

	// Set up metrics and do some initial debug tracking
	doDebuggingPaperwork(req, res);

	if (req.method === 'OPTIONS') {
		next();
		return;
	}

	// Couple the incoming http request to a uncachable response.
	res.set('cache-control', 'private, no-cache, max-age=0');

	getAllocationID(req, res).then(function(id) {

		// res.locals.flagsArray is provided by next-express
		var tests = getABTests(res.locals.flagsArray);

		var allocation = getAllocation(tests, id);

		debug("User A/B allocation: ",allocation.join(', '));

		// See the test allocation in graphite
		allocation.forEach(function (test) {
			Metrics.count(test.replace(/:/g, '.'));
		});

		// Set the allocation header and end the response
		res.setHeader('X-FT-AB', allocation.join(','));
		res.sendStatus(200);
		next();
		return;
	}).catch(function(e) {
		debug("Error getting the allocation ID");
		res.sendStatus(500);
		next();
		return;
	});
};
