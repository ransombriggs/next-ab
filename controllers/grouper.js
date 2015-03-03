"use strict";

var tests		= require('../models/tests');
var seedrandom	= require('seedrandom');

module.exports = function(req, res) {

	var eRightsId = req.headers['x-ft-user-id'];

	if (eRightsId) {

		var expires = new Date(Date.now() + 1000*60*60*24); // 1 day

		var allocation = tests.map(function (test) {
			var rng = seedrandom(eRightsId + test.flag);
			var group = (rng() > 0.5) ? 'variant' : 'control';
			return test.flag + ':' + group;
		});

		res.cookie('next-ab', allocation.join(','), { expires: expires });
	}

	var destination = 'http://next.ft.com';

	if (/https?:\/\/next.ft.com/.test(req.query.location)) {
		destination = req.query.location;
	}

	res.redirect(302, destination);
};
