.PHONY: test

install:
	origami-build-tools install

clean:
	next-build-tools clean

run:
	export PORT=5050; nodemon app.js

test:
	origami-build-tools verify
	export HOSTEDGRAPHITE_APIKEY=1; export PORT=5050; mocha

deploy:
	next-build-tools deploy
