var express = require('ft-next-express');
var app = module.exports = express();



app.get('/__gtg', function(req, res) {
	res.status(200).send('OK');
});

module.exports.listen = app.listen(process.env.PORT, function() {
	console.log("Listening on port", process.env.PORT);
});
