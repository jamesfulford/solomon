#!/bin/bash -e

export TAG=`git rev-parse HEAD`

apt update -y && apt upgrade -y
apt install -y python3-pip mysql-shell
pip3 install --upgrade pip
pip3 install --upgrade --user awscli

# ECR is where images are pushed to by CI
# `aws configure` was configured manually once
~/.local/bin/aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 383314943195.dkr.ecr.us-east-1.amazonaws.com

# a pull should have been done earlier
docker-compose pull

# run migrations (might be no-op)
./update-db.sh

# update containers as applicable
docker-compose up

docker system prune --force --all --volumes
