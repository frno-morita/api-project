#!/bin/bash

set -e

# Change to parent dir
pushd $(dirname $0)/.. > /dev/null

docker-compose build yarn
docker-compose run --rm yarn

popd > /dev/null