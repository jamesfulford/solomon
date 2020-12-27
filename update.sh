#!/bin/bash -e

export TAG=`git rev-parse HEAD`

# await prior updates to settle
aws cloudformation wait stack-update-complete --stack-name solomon

# build and push containers
docker context use default
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 383314943195.dkr.ecr.us-east-1.amazonaws.com
docker-compose build && docker-compose push

# update database
./seed-database.sh

# switch contexts
trap "docker context use default" EXIT
docker context use solomon

# execute update
set +e
output=`docker compose up 2>&1`
return_code="$?"

echo $output

echo

# if error was because there were no changes, then continue anyway
if [[ "0" != "$return_code" ]]; then
    if [[ $output == *"The submitted information didn't contain changes. Submit different information to create a change set."* ]]; then
        echo "(Its fine, just no changes is all.)"
        echo
    else
        echo "Some error occurred. Exiting!"
        exit 1
    fi
fi

set -e
