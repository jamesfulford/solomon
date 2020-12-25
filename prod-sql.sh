#!/bin/bash

mysql -uadmin -p`cat secrets/db-rootpassword` -h `cat secrets/db-host` -e "$@"
