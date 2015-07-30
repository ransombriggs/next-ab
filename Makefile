GIT_HASH := $(shell git rev-parse --short HEAD)
TEST_HOST := "ft-ab-branch-${GIT_HASH}"

.PHONY: test

install:
	npm install origami-build-tools
	origami-build-tools install

clean:
	git clean -xfd

run:
	export PORT=5050; nodemon app.js

test: build-production
	nbt verify --skip-layout-checks
	export HOSTEDGRAPHITE_APIKEY=1; export PORT=5101; mocha ./tests

build-production:
	nbt about

provision:
	next-build-tools provision ${TEST_HOST}
	next-build-tools configure ft-next-ab ${TEST_HOST} --overrides "NODE_ENV=branch" --no-splunk
	next-build-tools deploy ${TEST_HOST} --skip-enable-preboot --docker

tidy:
	nbt destroy ${TEST_HOST}

deploy:
	nbt configure --no-splunk
	nbt deploy --docker
