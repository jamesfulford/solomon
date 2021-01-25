#!/bin/bash -e

export TAG=`git rev-parse HEAD`

# WIP undo commenting:
# apt update -y && apt upgrade -y
# apt install -y python3-pip
# apt-get install -y mysql-client
# pip3 install --upgrade pip
# pip3 install --upgrade --user awscli

# ECR is where images are pushed to by CI
# `aws configure` was configured manually once
~/.local/bin/aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 383314943195.dkr.ecr.us-east-1.amazonaws.com

# a push should have been done earlier
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull


# ensure mysql is running so we can run migrations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --no-deps -d mysql
# run migrations (might be no-op)
./update-db.sh

# update containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# cleanup
docker system prune --force --all --volumes
