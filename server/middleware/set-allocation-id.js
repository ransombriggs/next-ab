
"use strict";

// Set the allocation ID as a local variable.
var getAllocationID = require('../promise-of-id');

module.exports = function(req, res, next){
	getAllocationID(req, res)
		.then(function(user) {
			res.locals.user = user;
			next();
		})
		.catch(function(e) {
			console.log(e);
			next();
		});
};
