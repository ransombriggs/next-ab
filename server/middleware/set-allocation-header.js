
const allocate = require('../allocate');

module.exports = function(req, res, next) {
	const allocation = allocate(res.locals.tests, res.locals.user);
	res.set('x-ft-ab', (allocation) ? allocation : '-');
	if (allocation) {
		res.set('ft-allocation-id', res.locals.user.uuid);
	}

	const sessionToken = req.get('ft-session-token') || req.get('x-ft-session-token');
	if (sessionToken) {
		res.set('ft-session-token', sessionToken);
	}
	next();
};
