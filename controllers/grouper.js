"use strict";

var tests = require('../models/tests');
var seedrandom = require('seedrandom');
var debug = require('debug')('next-ab');
var Metrics = require('ft-next-express').metrics;
var uuid = require('node-uuid');
require('es6-promise').polyfill();

// Metrics and debugging
var doPaperwork = function(req, res) {
	Metrics.instrument(res, { as: 'express.http.res' });
	Metrics.instrument(req, { as: 'express.http.req' });
	debug('request headers: %s', JSON.stringify(req.headers));

	// Check for both new and deprecated headers for now
	var sessionToken = req.get('FT-Session-Token') || req.get('X-FT-Session-Token');
	debug('session token: %s', JSON.stringify(sessionToken));
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

// This logic for detecting the device ID could perhaps be
// moved to preflight — assuming all requests go via preflight.
// TODO: See how a "FT-Device-ID" cookie could be set by the CDN.
var getDeviceID = function(req, res) {
	var deviceID = (req.cookies && req.cookies['FT-Device-ID']) || req.get('FT-Device-ID') || req.headers['FT-Device-ID'] || uuid();
	req.headers['FT-Device-ID'] = deviceID;
	res.setHeader('FT-Device-ID', deviceID);

	// don't set a cookie if present in the client request
	if (!(req.cookies && req.cookies['FT-Device-ID']) && !req.headers['FT-Device-ID']) {
		var tenYearsInSeconds = 60 * 60 * 24 * 365 * 10;
		res.cookie('FT-Device-ID', deviceID, {
			domain: 'next.ft.com',
			maxAge: tenYearsInSeconds,
			secure: true
		});
	}

	return deviceID;
};

// allocationID is the ID to be used for AB segmentation
// It can be either the device ID or the user's uuid.
var getAllocationID = function(req, res){
	var allocationID;

	var isAnonymous = req.get('FT-Anonymous-User') || req.get('X-FT-Anonymous-User');
	if (isAnonymous) {
		allocationID = getDeviceID(req, res);
	}
	else {
		// Fetch the user's uuid
		delete req.headers['host'];
		fetch('https://session-next.ft.com/uuid', {
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
				allocationID = json.uuid;
			}
		})
		.catch(function(err) {
			debug('error determining user uuid', err);
		});
//		.catch(next);
	}

	return allocationID || getDeviceID(req, res);
};

// Allocate the user into an a/b segment for each test
var getAllocation = function(allocationID){
	var allocation = tests.map(function (test) {
		var rng = seedrandom(allocationID + test.flag);
		var group = (rng() > 0.5) ? 'off' : 'on';
		return test.flag + ':' + group;
	});
	return allocation;
};

module.exports = function(req, res, next) {
	if (req.method === 'OPTIONS') {
		next();
		return;
	}

	doPaperwork(req, res);

	// Couple the incoming http request to a uncachable response.
	res.set('cache-control', 'private, no-cache, max-age=0');

	var allocation = getAllocation(tests, getAllocationID(req, res));

	// See the test allocation in graphite
	allocation.forEach(function (test) {
		Metrics.count(test.replace(/:/g, '.'));
	});

	res.setHeader('x-ft-ab', allocation.join(','));
	res.sendStatus(200).end();
	return;
};
