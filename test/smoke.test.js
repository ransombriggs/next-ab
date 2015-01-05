var request = require('supertest');
var app = require('../app');


describe('smoke tests for the app', function() {

	before(function(done) {
		app.listen.then(done.bind(this, undefined));
	});

	it("Should serve a __gtg page", function(done) {
		request(app)
			.get('/__gtg')
			.expect(200, done);
	});

});
