GIT_HASH := $(shell git rev-parse --short HEAD)
TEST_APP := "ft-ab-branch-${GIT_HASH}"

.PHONY: test

install:
	npm install origami-build-tools
	origami-build-tools install

clean:
	git clean -xfd

run:
	export PORT=5050; nodemon server/app.js

unit-test:
	mocha ./tests/unit

test: unit-test
	nbt verify --skip-layout-checks

smoke:
	export DEBUG=ab; export HOSTEDGRAPHITE_APIKEY=1; mocha ./tests/smoke;

build-production:
	nbt about

provision:
	next-build-tools about
	next-build-tools provision ${TEST_HOST}
	next-build-tools configure ft-next-ab ${TEST_HOST} --overrides "NODE_ENV=branch" --no-splunk
	next-build-tools deploy ${TEST_HOST} --skip-enable-preboot --docker

tidy:
	nbt destroy ${TEST_HOST}

deploy:
	nbt configure --no-splunk
	nbt deploy --docker
