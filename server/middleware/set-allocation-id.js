
"use strict";

// Set the allocation ID as an app variable.
var getAllocationID = require('../promise-of-id');

module.exports = function(req, res, next){
	getAllocationID(req, res)
		.then(function(id) {
			res.locals.device = id;
			next();
		})
		.catch(function(e) {
			console.log(e);
			next();
		});
};
