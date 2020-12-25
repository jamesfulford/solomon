#!/bin/bash -e

export TAG=`git rev-parse HEAD`

# build and push containers
docker context use default
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 383314943195.dkr.ecr.us-east-1.amazonaws.com
docker-compose build && docker-compose push

# update database
./seed-database.sh

# update containers
docker context use solomon
docker compose up

docker context use default

# tagging
git tag -d prod
git push origin :prod
git tag -a prod -m "prod deployed `date`"
git push origin prod
