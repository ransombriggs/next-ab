.PHONY: test

install:
	npm install origami-build-tools
	origami-build-tools install

clean:
	nbt clean

run:
	export PORT=5050; nodemon app.js

test:
	nbt verify
	export HOSTEDGRAPHITE_APIKEY=1; export PORT=5050; mocha

deploy:
	nbt configure
	nbt deploy
