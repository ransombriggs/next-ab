"use strict";
var tests = require('../models/tests');

module.exports = function(req, res) {
	var eRightsId = req.headers['x-ft-user-id'];
	if (eRightsId) {
		var expires = new Date(Date.now() + 1000*60*60*24);
		var groups = tests.map(function(test) {
				if (test.expires < new Date())  {
					return;
				}

				// If the test expires before the default expiry,
				// reduce the expiry
				if (test.expires < expires) {
					expires = test.expires;
				}
				switch(test.allocate({ eRightsId: eRightsId })) {
					case true:
						return test.flag + ':on';
					case false:
						return test.flag + ':off';
				}
			}).filter(function(test) {
				return test !== undefined;
			});
		res.cookie('next-ab', groups.join(',') || 'none', { expires: expires });
	}

	var destination = 'http://next.ft.com';
	if (/https?:\/\/next.ft.com/.test(req.query.location)) {
		destination = req.query.location;
	}
	res.redirect(302, destination);
};
