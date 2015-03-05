"use strict";

var tests		= require('../models/tests');
var seedrandom	= require('seedrandom');
var debug		= require('debug')('next-ab');

module.exports = function(req, res, next) {

	var eRightsId = req.headers['x-ft-user-id'];

	debug(req.headers);

	res.setHeader('cache-control', 'no-cache');

	if (eRightsId) {

		var allocation = tests.map(function (test) {
			var rng = seedrandom(eRightsId + test.flag);
			var group = (rng() > 0.5) ? 'off' : 'on';
			return test.flag + ':' + group;
		});

		res.setHeader('x-ft-ab', allocation.join(','));
		res.sendStatus(200).end();

		// FIXME - take this out
		debug('Found an eRights ID');
		debug(res._headers);

		return;
	}

	debug('Found no eRights ID. Not putting in to an AB test group.');
	res.setHeader('x-ft-ab', '-');
	res.sendStatus(200).end();
};
