'use strict';

let lastCheckOk = false;
let lastCheckOutput = 'Waiting for check';
let panicGuide = 'Don\'t panic';
let lastCheckTime;

const fetchres = require('fetchres');
const urlBase = `https://www.hostedgraphite.com/bbaf3ccf/${process.env.HOSTEDGRAPHITE_READ_APIKEY}/graphite/render/?_salt=1445269005.584&from=-10minutes&format=json&target=`;

function checkFlagSegmentation() {

	fetch('http://next-flags.ft.com/')
		.then(fetchres.json)
		.then(flags => {
			return Promise.all(flags
				.filter(f => f.abTestState)
				// each of these requests gets the last 10 minutes' segmentation data for a given test

				.map(f => fetch(`${urlBase}summarize(divideSeries(sumSeries(heroku.ab.*.allocation.${f.name}.on),sumSeries(heroku.ab.*.allocation.${f.name}.*)),"10min","sum",true))`)
										.then(fetchres.json)
										.then(data => {
											return {
												name: f.name,
												split: data[0].datapoints[0]
											};
										})
										.catch(() => false)
				))
		})
		.then(tests => {
			// We don't want the health check to fail if graphite is a bit flaky
			// so we only throw if more than half the requests to graphite fail
			const actualTests = tests.filter(test => test);
			if (actualTests.length < tests.length / 2) {
				throw 'Too many requests to graphite failed - unable to verify segmentation is OK';
			}

			if (tests.some(test => test.split < 0.45 || test.split > 0.55)) {
				throw `AB test ${test.name} incorrectly segmented`;
			}
		})
		.then(() => {
			lastCheckOk = true;
			lastCheckTime = new Date();
			lastCheckOutput = 'AB tests segmenting correctly';
			panicGuide = 'Don\'t panic';
		})
		.catch(err => {
			lastCheckOk = false;
			lastCheckTime = new Date();
			lastCheckOutput = 'Error segmenting users: ' + (err.message ? err.message : err);
			panicGuide = 'TBA';
		});

}

checkFlagSegmentation();
setInterval(checkFlagSegmentation, 1000 * 60);

module.exports = {
	getStatus: () => {
		return {
			name: "Next AB is segmenting traffic effectively",

			ok: lastCheckOk,
			checkOutput: lastCheckOutput,
			lastUpdated: lastCheckTime,
			panicGuide: panicGuide,

			severity: 3,
			businessImpact: "AB tests run on next will not be fair tests",
			technicalSummary: "For each AB test looks at metrics sent to graphite to see if there is a reasonably even split of traffic (within 5 points of 50%)"
		};
	}
};
