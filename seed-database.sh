#!/bin/bash -e

db_name=`cat ./secrets/db-name`
db_username=`cat ./secrets/db-username`
db_password=`cat ./secrets/db-password`
db_migration_username=`cat ./secrets/db-migration-username`
db_migration_password=`cat ./secrets/db-migration-password`

mysql_script=`cat seed-database.sql`

mysql_script=`echo $mysql_script | sed "s/db_name/$db_name/g"`
mysql_script=`echo $mysql_script | sed "s/db_username/$db_username/g"`
mysql_script=`echo $mysql_script | sed "s/db_password/$db_password/g"`
mysql_script=`echo $mysql_script | sed "s/db_migration_username/$db_migration_username/g"`
mysql_script=`echo $mysql_script | sed "s/db_migration_password/$db_migration_password/g"`

echo $mysql_script | mysql -uadmin -p`cat secrets/db-rootpassword` -h `cat secrets/db-host`
