.PHONY: test

run:
	export PORT=5050; node app.js

test:
	origami-build-tools verify
	export PORT=5050; mocha

