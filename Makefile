GIT_HASH := $(shell git rev-parse --short HEAD)
TEST_HOST := "ft-ab-branch-${GIT_HASH}"

.PHONY: test

install:
	npm install origami-build-tools
	origami-build-tools install

clean:
	git clean -xfd

run:
	export PORT=5050; nodemon server/app.js

test:
	nbt verify --skip-layout-checks
	export HOSTEDGRAPHITE_APIKEY=1; export PORT=5101; mocha ./test

build-production:
	nbt about

provision:
	nbt about
	nbt provision ${TEST_HOST}
	nbt configure ft-next-ab ${TEST_HOST} --overrides "NODE_ENV=branch" --no-splunk
	nbt deploy ${TEST_HOST} --skip-enable-preboot --docker

tidy:
	nbt destroy ${TEST_HOST}

deploy:
	nbt configure --no-splunk
	nbt deploy --docker
