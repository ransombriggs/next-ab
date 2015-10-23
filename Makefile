GIT_HASH := $(shell git rev-parse --short HEAD)
TEST_HOST := "ft-ab-branch-${GIT_HASH}"

.PHONY: test

install:
	origami-build-tools install

clean:
	git clean -xfd

run:
	export PORT=5050; nodemon server/app.js

test:
	export HOSTEDGRAPHITE_APIKEY=1; export PORT=5101; mocha --recursive ./test
	nbt verify --skip-layout-checks

build-production:
	nbt build --skip-js --skip-sass

provision:
	nbt build --skip-js --skip-sass
	nbt provision ${TEST_HOST}
	nbt configure ft-next-ab ${TEST_HOST} --overrides "NODE_ENV=branch" --no-splunk
	nbt deploy ${TEST_HOST} --skip-enable-preboot
	nbt test-urls ${TEST_HOST}

tidy:
	nbt destroy ${TEST_HOST}

deploy:
	nbt configure --no-splunk
	nbt deploy

deploy-fastly:
	nbt deploy-vcl -e --service FASTLY_SERVICE_ID --vars SERVICEID --main main.vcl ./vcl/

test-fastly:
	export AMMIT_HOST='https://ammit.ft.com'; mocha ./test/cdn.test

deploy-fastly-stage:
	nbt deploy-vcl -e --service FASTLY_STAGING_SERVICE_ID --vars SERVICEID --main main.vcl ./vcl/

test-fastly-stage:
	export AMMIT_HOST='https://ammit-staging.ft.com'; mocha ./test/cdn.test
