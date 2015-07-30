var getAllocation = function(tests, allocationID){

	if(!response.ok){
		Metrics.count('uuid.not-found');
		debug('No uuid found');
		return {};
	}
debug("allocationID: ",allocationID);

	return response.json();
var allocation = tests.map(function (test) {
	var rng = seedrandom(allocationID + test.name);
	var group = (rng() > 0.5) ? 'off' : 'on';
	return test.name + ':' + group;
});
return allocation;
};
