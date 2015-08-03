
module.exports = function (sessionToken) { 

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
