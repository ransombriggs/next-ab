
'use strict';

var nodeUuid = require('node-uuid');
var metrics = require('ft-next-express').metrics;

module.exports = function(req) {

	// Requests receive an A/B allocation for each feature that has an active A/B test.
	// A/B allocation is based on an allocation ID. Ideally the allocation ID is the
	// user's uuid, which is detected if given an FT session token.
	// If the user is anonymous, an allocation ID is generate and returned.
	// See: http://git.svc.ft.com/projects/NEXT/repos/preflight-requests/browse/src/tasks/session.js
	var sessionToken = req.get('ft-session-token') || req.get('x-ft-session-token');
	var allocationId = req.get('ft-allocation-id');
	var isAnonymous = !sessionToken && !allocationId;

	if (sessionToken) {
		metrics.count('id.has-session-token', 1);
	}

	if (allocationId) {
		metrics.count('id.has-allocation-id', 1);
	}

	if (isAnonymous) {
		metrics.count('id.is-anonymous', 1);
	}

	// If an ft-session-token is provided, attempt to load uuid via the session api.
	if (sessionToken) {
		return fetch('https://session-next.ft.com/uuid', {
			headers: {
				'ft-session-token': sessionToken
			}
		})
		.then(function(response) {
			if (response.status >= 400) {
				throw new Error('Invalid session');
			}
			return response.json();
		})
		.then(function(json) {
			return json.uuid;
		});
	}

	// If an allocation ID is provided, use that.
	if (allocationId) {
		return Promise.resolve(allocationId);
	}

	// If neither ft-session-token nor allocation ID were provided,
	// use a random-generated uuid.
	if (isAnonymous) {
		return Promise.resolve(nodeUuid());
	}

	return Promise.reject("Could not set allocation ID");
};
