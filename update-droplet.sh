#!/bin/bash -e

export TAG=`git rev-parse HEAD`

docker-compose build

./update-db.sh
docker-compose up
