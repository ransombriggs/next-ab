'use strict';
if (process.env.AMMIT_HOST) {
	require('isomorphic-fetch');
	const expect = require('chai').expect;

	require('./api.test');

	describe('Varying responses', function () {

		it('should allocate anonymous users independently', function (done) {
			Promise.all([
				fetch(process.env.AMMIT_HOST + '/test-point'),
				fetch(process.env.AMMIT_HOST + '/test-point')
			])
				.then(responses => {
					expect(responses[0].headers.get('ft-allocation-id')).to.not.equal(responses[1].headers.get('ft-allocation-id'));
					// can't guarantee the actual ab allocation will be different so we
					// trust the unit tests to prove that different allocation id imply different allocations
					// expect(responses[0].headers.get('x-ft-ab')).to.not.equal(responses[1].headers.get('x-ft-ab'));
					done();
				})
				.catch(e => console.log(e))
		})

		it('should allocate allocated users consistently', function (done) {
			Promise.all([
				fetch(process.env.AMMIT_HOST + '/test-point', {
					headers: {
						'ft-allocation-id': 'sadhlkfhsa-sadjf-say9s9-sagsf'
					}
				}),
				fetch(process.env.AMMIT_HOST + '/test-point', {
					headers: {
						'ft-allocation-id': 'sadhlkfhsa-sadjf-say9s9-sagsf'
					}
				})
			])
				.then(responses => {
					expect(responses[0].headers.get('ft-allocation-id')).to.equal(responses[1].headers.get('ft-allocation-id'));
					expect(responses[0].headers.get('x-ft-ab')).to.equal(responses[1].headers.get('x-ft-ab'));
					done();
				})
				.catch(e => console.log(e))
		})


		it('should allocate users with valid session consistently', function (done) {

			Promise.all([
				fetch(process.env.AMMIT_HOST + '/test-point', {
					headers: {
						'ft-session-token': process.env.SESSION_TOKEN
					}
				}),
				fetch(process.env.AMMIT_HOST + '/test-point', {
					headers: {
						'x-ft-session-token': process.env.SESSION_TOKEN
					}
				})
			])
				.then(responses => {
					expect(responses[0].headers.get('ft-allocation-id')).to.equal(responses[1].headers.get('ft-allocation-id'));
					expect(responses[0].headers.get('x-ft-ab')).to.equal(responses[1].headers.get('x-ft-ab'));
					done();
				})
				.catch(e => console.log(e))
		});
	});
}
