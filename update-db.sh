#!/bin/bash -e

db_name=`cat ./secrets/db-name`
db_username=`cat ./secrets/db-username`
db_password=`cat ./secrets/db-password`
db_migration_username=`cat ./secrets/db-migration-username`
db_migration_password=`cat ./secrets/db-migration-password`

script_path=`mktemp`
cp seed-database.sql $script_path
trap "rm $script_path" EXIT

sed -i'.bak' "s/db_name/$db_name/g" $script_path
sed -i'.bak' "s/db_username/$db_username/g" $script_path
sed -i'.bak' "s/db_password/$db_password/g" $script_path
sed -i'.bak' "s/db_migration_username/$db_migration_username/g" $script_path
sed -i'.bak' "s/db_migration_password/$db_migration_password/g" $script_path

echo "Initializing database..."
mysql --protocol=TCP -uroot -p`cat secrets/db-rootpassword` -h `cat secrets/db-host | sed "s/^mysql$/localhost/g"` < $script_path

./prod-sql.sh "select * from information_schema.USER_PRIVILEGES;"

echo
echo
echo "Running migrations..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f migrations.compose.yml run --rm migrations
