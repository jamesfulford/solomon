#!/bin/bash

mysql --protocol=TCP -uroot -p`cat secrets/db-rootpassword` -h `cat secrets/db-host | sed "s/^mysql$/localhost/g"` -e "$@"
