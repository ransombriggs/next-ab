"use strict";

var nodeUuid = require('node-uuid');

// Set the allocation ID as an app variable.
var getAllocationID = function(req, res){
	var allocationID;

	// Requests receive an A/B allocation for each feature that has an active A/B test.
	// A/B allocation is based on an allocation ID. Ideally the allocation ID is the
	// user's uuid, but if the user is anonymous, it fails back to their device ID.
	// See: http://git.svc.ft.com/projects/NEXT/repos/preflight-requests/browse/src/tasks/session.js
	var sessionFailure = req.get('ft-preflight-session-failure') || req.get('x-ft-preflight-session-failure');
	var uuid = req.get('ft-user-id') || req.get('x-ft-user-id');
	var session = req.get('ft-session-token') || req.get('x-ft-session-token');
	var deviceID = req.get('ft-device-id') || req.get('x-ft-device-id');
	var isAnonymous = req.get('ft-anonymous-user') || req.get('x-ft-anonymous-user');


	// If preflight could not validate the session, don't allocate A/B tests.
	if (sessionFailure) {
		return Promise.reject('Preflight session failure detected');
	}

	// Ideally, the allocation is based on the user's uuid.
	if (uuid) {
		return Promise.resolve(uuid);
	}

	// If uuid is not provided, attempt to load it via the session api.
	if (session) {
		delete req.headers['host'];
		return fetch('https://session-next.ft.com/uuid', {
			headers: req.headers
		})
		.then(function(response){
			if(response.ok){
				var json = response.json();
				if (json.uuid) {
					return json.uuid;
				}
			}
		});
	}

	// If neither uuid nor session were provided, use the user's device ID.
	if (deviceID) {
		return Promise.resolve(deviceID);
	}

	// If neither uuid, session nor deviceID were provided, but
	// an isAnonymous header was, what does that mean?
	if (isAnonymous) {
		return Promise.resolve(nodeUuid());
	}

	return Promise.reject("Could not set allocation ID");
};

module.exports = function(req,res,next){
	getAllocationID(req, res)
		.then(function(allocationID) {
			app.set('allocationID',allocationID);
			next();
		})
		.catch(function(e) {
			console.log('Error:',e);
			next();
		});
};
