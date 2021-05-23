# Solomon
## Take back your bank account

[Storybook](https://jamesfulford.github.io/solomon)

## Concepts

- Rule: a recurring transaction. Saved in the app.
- Transaction: individual changes in your balance on specific dates. Computed by the app.

```bash
# Start
docker-compose up -d

# Run solomon with debug
DEBUG=1 docker-compose up --no-deps --force-recreate solomon

# Running unit tests
docker-compose run -p 3001:3001 --rm --no-deps -e "DEBUG=" solomon python manage.py test

# Shut down
docker-compose down
```

## Prod

```
ssh -L 3306:localhost:3306 solomon
docker run -e "PMA_HOST=`cat secrets/db-host | sed "s/^mysql$/localhost/g"`" -p 8091:80 phpmyadmin/phpmyadmin
mysql --protocol=TCP -uroot -p`cat secrets/db-rootpassword` -h `cat secrets/db-host | sed "s/^mysql$/localhost/g"`
```
