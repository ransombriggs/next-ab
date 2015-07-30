"use strict";

module.exports = function (res, req, next) {

	// FIXME - if session is present in the request header hit the session id to derive UUID, otherwise just called next()
	return fetch('https://session-next.ft.com/uuid', {
		headers: req.headers
	})

}

