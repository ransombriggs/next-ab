.PHONY: test

install:
	npm install origami-build-tools
	origami-build-tools install

clean:
	git clean -xfd

run:
	export PORT=5050; nodemon app.js

test:
	nbt verify --skip-layout-checks
	export HOSTEDGRAPHITE_APIKEY=1; export PORT=5050; mocha

deploy:
	nbt configure --no-splunk
	nbt deploy
