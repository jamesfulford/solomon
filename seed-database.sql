CREATE DATABASE IF NOT EXISTS db_name;
GRANT INSERT, SELECT, UPDATE, DELETE ON db_name.* TO db_username IDENTIFIED BY 'db_password';
GRANT INSERT, SELECT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON db_name.* TO db_migration_username IDENTIFIED BY 'db_migration_password';
-- https://stackoverflow.com/questions/2322759/how-to-configure-database-permissions-for-a-django-app
