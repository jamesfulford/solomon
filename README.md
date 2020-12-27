# Solomon
## Take back your bank account

## Concepts

- Rule: a recurring transaction. Saved in the app.
- Transaction: individual changes in your balance on specific dates. Computed by the app.

```bash
# Start
DEBUG= docker-compose up -d

# Running unit tests
DEBUG= docker-compose run -p 3001:3001 --rm --no-deps solomon python manage.py test

# Run BDD e2e tests
docker-compose exec -- solomon python -m behave

# Shut down
docker-compose down
```
