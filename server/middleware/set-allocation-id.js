
"use strict";

// Set the allocation ID as a local variable.
var getAllocationID = require('../promise-of-id');

module.exports = function(req, res, next){
	getAllocationID(req, res)
		.then(function(id) {
			res.locals.id = id;
			next();
		})
		.catch(function(e) {
			console.log(e);
			next();
		});
};
