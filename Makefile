GIT_HASH := $(shell git rev-parse --short HEAD)
TEST_HOST := "ft-ab-branch-${GIT_HASH}"
TEST_URL := "http://ft-ab-branch-${GIT_HASH}.herokuapp.com/fb368c7a-c804-11e4-8210-00144feab7de"

.PHONY: test

install:
	npm install origami-build-tools
	origami-build-tools install --verbose

clean:
	git clean -xfd

run:
	export PORT=5050; nodemon app.js

test:
	nbt verify --skip-layout-checks
	export HOSTEDGRAPHITE_APIKEY=1; export PORT=5050; mocha

tidy:
	nbt destroy ${TEST_HOST}

deploy:
	nbt configure --no-splunk
	nbt deploy
