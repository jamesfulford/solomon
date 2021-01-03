# Solomon
## Take back your bank account

## Concepts

- Rule: a recurring transaction. Saved in the app.
- Transaction: individual changes in your balance on specific dates. Computed by the app.

```bash
# Start
docker-compose up -d

# Run solomon with debug
DEBUG=1 docker-compose up --no-deps --force-recreate solomon

# Running unit tests
DEBUG= docker-compose run -p 3001:3001 --rm --no-deps solomon python manage.py test

# Shut down
docker-compose down
```

## Prod

```
docker run -e "PMA_HOST=`cat secrets/db-host`" -p 8091:80 phpmyadmin/phpmyadmin
```