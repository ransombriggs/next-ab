.PHONY: test

run:
	export PORT=5050; node app.js

test:
	export PORT=5050; mocha

