"use strict";

var tests		= require('../models/tests');
var seedrandom	= require('seedrandom');
//var debug		= require('debug')('next-ab');
var Metrics		= require('ft-next-express').metrics;
require('es6-promise').polyfill();

module.exports = function(req, res, next) {

	Metrics.instrument(res, { as: 'express.http.res' });
	Metrics.instrument(req, { as: 'express.http.req' });

	// check for both new and deprecated headers for now
	var sessionToken = req.get('FT-Session-Token') || req.get('X-FT-Session-Token');

	res.set('cache-control', 'private, no-cache, max-age=0');

	function noAB() {
		// Presently we don't segment non-signed out users
		Metrics.count('erights.not-found'); // keep this for backwards compatibility
		Metrics.count('sessionToken.not-found');

		res.setHeader('x-ft-ab', '-');
		res.sendStatus(200).end();
		return;
	}

	if(!sessionToken){
		return noAB();
	}

	delete req.headers['host'];
	fetch('https://session-next.ft.com/uuid', {headers:req.headers}).then(function(response){
		if(!response.ok){
			Metrics.count('uuid.not-found');
			return noAB();
		}

		return response.json();
	}).then(function(json){
		var userID = json.uuid;
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
	});
};
