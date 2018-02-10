#!/bin/bash

set -e

# Change to parent dir
pushd $(dirname $0)/.. > /dev/null

dev/yarn.sh

popd > /dev/null