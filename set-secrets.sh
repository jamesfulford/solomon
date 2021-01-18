#!/bin/bash

exit 1

# TODO: figure out how rotating can work properly
docker context use solomon
docker secret create django-secret-key ./secrets/django-secret-key
docker secret create db-name ./secrets/db-name
docker secret create db-username ./secrets/db-username
docker secret create db-password ./secrets/db-password
docker secret create db-host ./secrets/db-host
docker secret create db-port ./secrets/db-port
docker secret create configcat-key ./secrets/configcat-key
# then, update docker-compose with arns

