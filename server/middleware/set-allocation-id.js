
"use strict";

var nodeUuid = require('node-uuid');

// Set the allocation ID as an app variable.
var getAllocationID = function(req, res){

	// Requests receive an A/B allocation for each feature that has an active A/B test.
	// A/B allocation is based on an allocation ID. Ideally the allocation ID is the
	// user's uuid, but if the user is anonymous, it fails back to their device ID.
	// See: http://git.svc.ft.com/projects/NEXT/repos/preflight-requests/browse/src/tasks/session.js
	var sessionToken = req.get('ft-session-token') || req.get('x-ft-session-token');
	var deviceID = req.get('ft-device-id');

	// If uuid is not provided, attempt to load it via the session api.
	if (sessionToken) {
		return fetch('https://session-next.ft.com/uuid', {
			headers: {
				'ft-session-token': sessionToken
			}
		})
		.then(function(response) {
			return response.json();
		})
		.then(function(json) {
			if (json.uuid) {
				return json.uuid;
			}
			else {
				return Promise.reject('Recieved OK response from uuid server but uuid not returned');
			}
		});
	}

	// If neither uuid nor session were provided, use the user's device ID.
	if (deviceID) {
		return Promise.resolve(deviceID);
	}

	// If neither uuid, session nor deviceID were provided, but an isAnonymous header
	// was, what does that mean? In any case, fail to a random generated uuid.
	// This'll be cached if the CDN caches the allocationID.
	if (isAnonymous) {
		return Promise.resolve(nodeUuid());
	}

	return Promise.reject("Could not set allocation ID");
};

module.exports = function(req,res,next){
	getAllocationID(req, res)
		.then(function(allocationID) {

			// TODO: Make the CDN cache the allocationID?
			res.locals.allocationID = allocationID;
			next();
		})
		.catch(function(e) {
			console.log(e);
			next();
		});
};
