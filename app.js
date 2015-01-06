/*jshint node:true*/
"use strict";

var express = require('ft-next-express');
var app = module.exports = express();
var tests = require('./models/tests');

app.get('/ab', function(req, res) {
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
				switch(test.grouper({ eRightsId: eRightsId })) {
					case true:
						return test.flag + ':on';
					case false:
						return test.flag + ':off';
				}
			}).filter(function(test) {
				return test !== undefined;
			}).join(',');
		res.cookie('next-ab', groups || 'none', { expires: expires });
	}

	var destination = 'http://next.ft.com';
	if (/https?:\/\/next.ft.com/.test(req.query.location)) {
		destination = req.query.location;
	}
	res.redirect(302, destination);
});

app.get('/__gtg', function(req, res) {
	res.status(200).send('OK');
});

app.get('/', function(req, res) {
	res.redirect(302, 'https://github.com/financial-times/next-ab');
});

module.exports.listen = app.listen(process.env.PORT, function() {
	console.log("Listening on port", process.env.PORT);
});
