
"use strict";

// Set the allocation ID as an app variable.
var getAllocationID = require('../promise-of-id');

module.exports = function(req, res, next){
	getAllocationID(req, res)
		.then(function(allocation) {
			res.locals.allocation = allocation;
			next();
		})
		.catch(function(e) {
			console.log(e);
			next();
		});
};
