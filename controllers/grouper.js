"use strict";

var tests		= require('../models/tests');
var seedrandom	= require('seedrandom');

module.exports = function(req, res, next) {

	var eRightsId = req.headers['x-ft-user-id'];

	if (eRightsId) {

		var allocation = tests.map(function (test) {
			var rng = seedrandom(eRightsId + test.flag);
			var group = (rng() > 0.5) ? 'variant' : 'control';
			return test.flag + ':' + group;
		});

		res.setHeader('x-ft-ab', allocation.join(','));
		res.sendStatus(200).end();
		return;
	}

	res.sendStatus(200).end();
};
