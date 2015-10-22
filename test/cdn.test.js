'use strict';

require('isomorphic-fetch');
const expect = require('chai').expect;

require('./api.test');

describe('Varying responses', function () {

	it('should allocate anonymous users independently', function (done) {
		Promise.all([
			fetch(process.env.AMMIT_HOST + '/ghjl'),
			fetch(process.env.AMMIT_HOST + '/ghjl')
		])
			.then(responses => {
				console.log(responses[0].headers.get('x-ft-ab'))
				expect(responses[0].headers.get('ft-allocation-id')).to.not.equal(responses[0].headers.get('ft-allocation-id'));
				expect(responses[0].headers.get('x-ft-ab')).to.not.equal(responses[0].headers.get('x-ft-ab'));
				done();
			})
			.catch(e => console.log(e))
	})

	it('should allocate allocated users consistently', function (done) {
		Promise.all([
			fetch(process.env.AMMIT_HOST + '/ghjl', {
				headers: {
					'ft-allocation-id': 'sadhlkfhsa-sadjf-say9s9-sagsf'
				}
			}),
			fetch(process.env.AMMIT_HOST + '/ghjl', {
				headers: {
					'ft-allocation-id': 'sadhlkfhsa-sadjf-say9s9-sagsf'
				}
			})
		])
			.then(responses => {
				expect(responses[0].headers.get('ft-allocation-id')).to.equal(responses[0].headers.get('ft-allocation-id'));
				expect(responses[0].headers.get('x-ft-ab')).to.equal(responses[0].headers.get('x-ft-ab'));
				done();
			})
			.catch(e => console.log(e))
	})


	it('should allocate users with valid session consistently', function (done) {
		Promise.all([
			fetch(process.env.AMMIT_HOST + '/ghjl', {
				headers: {
					'ft-session': 'sadhlkfhsa-sadjf-say9s9-sagsf'
				}
			}),
			fetch(process.env.AMMIT_HOST + '/ghjl', {
				headers: {
					'x-ft-session': 'sadhlkfhsa-sadjf-say9s9-sagsf'
				}
			})
		])
			.then(responses => {
				expect(responses[0].headers.get('ft-allocation-id')).to.equal(responses[0].headers.get('ft-allocation-id'));
				expect(responses[0].headers.get('x-ft-ab')).to.equal(responses[0].headers.get('x-ft-ab'));
				done();
			})
			.catch(e => console.log(e))
	})
});
