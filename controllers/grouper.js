"use strict";

var tests		= require('../models/tests');
var seedrandom	= require('seedrandom');
//var debug		= require('debug')('next-ab');
var Metrics		= require('next-metrics');

module.exports = function(req, res, next) {

	Metrics.instrument(res, { as: 'express.http.res' });
	Metrics.instrument(req, { as: 'express.http.req' });

	var eRightsId = req.headers['x-ft-user-id'];

	// debug(req.headers);

	res.setHeader('cache-control', 'no-cache');

	if (eRightsId) {

		var allocation = tests.map(function (test) {
			var rng = seedrandom(eRightsId + test.flag);
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

		return;
	}

	// Presently we don't segment non-signed out users
	Metrics.count('erights.not-found');

	res.setHeader('x-ft-ab', '-');
	res.sendStatus(200).end();
};
