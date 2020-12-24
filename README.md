# Solomon
## Redeem God's Wealth

## Concepts

- Rule: a recurring transaction. Saved in the app.
- Transaction: individual changes in your balance on specific dates. Computed by the app.

### Ordering

First, focusing on exposing 3 main resources:

- Rules #3
- Transactions #4
- Users #2

At this point, we can at least see our future. However, we want to be able to shape our future. If we can simulate what a decision would look like financially, we can make more informed decisions about our future. #5 (pure vision story)

People like Excel. That's cool. We'll let people continue analysis in Excel or other tools. #6 (strong ROI - reporting is a product black hole, we can't compete with Excel)

Opening our app for developers will let others solve problems easier and extend our app. #7 (force-multiplier - what PO doesn't want more devs?)

To stay on track with your plan, you might need a timely nudge. Some transactions are not automatic, so if you want, we can remind you ahead of time. #8 (pure vision story)

We're building a great thing here, let's make it easy for people to understand it! #11 (starting toward minimum marketable solution after decent set of features)

As a team, we cannot operate forever without financial support. We'll package this as a subscription solution. #12 (minimum marketable solution)

Our solution should not require interrupting your life to make a decision. #10 (usability)

It's hard sticking to a plan! We'll remind you of your plan and guide you to re-take control of your financial future. #17 (pure vision story)

Future stories would focus around the "wise" part of money-wise, more nudging, and reconciling your plan with your current and past finances.

### Estimating

Since all members of the scrum team are developers (with some hybrid scrum/PO), all team members participate in estimation. We did **planning poker**, one story at a time.

### A Story must: (Definition of Ready)

- Must define:
  - Title
  - User story opening sentence (As a _____, I want _____ so that _____)
  - Additional Details
  - Acceptance criteria
  - Estimate
  - Person who accepts (unless otherwise noted, assume PO)
- Have comments on:
  - Performance
  - Security
  - Testing
- Have an established demo
- Have a ready environment (can run locally and push to GitHub)


# Readme for sprint 1 is in README_Sprint_1.md
[Sprint 1 README](README_Sprint_1.md)

# Readme for sprint 2 is in README_Sprint_2.md
[Sprint 2 README](README_Sprint_2.md)

# Readme for sprint 3 is in README_Sprint_3.md
[Sprint 3 README](README_Sprint_3.md)


### Requirements
- Docker

### How to run!
#### Development:
```bash
# Start up WITHOUT debugging (in background)
DEBUG= docker-compose -f docker-compose.yml -f docker-compose.override.dev.yml up -d --build moneywise-backend 

# Start up WITH debug
DEBUG=True docker-compose -f docker-compose.yml -f docker-compose.override.dev.yml up -d

# Running tests
DEBUG= docker-compose -f docker-compose.yml -f docker-compose.override.dev.yml run -p 3001:3001 --rm moneywise-backend python manage.py test

# Run BDD behave tests
docker-compose -f docker-compose.yml -f docker-compose.override.dev.yml exec -it moneywise-backend python -m behave

# Apply migrations
docker-compose -f docker-compose.yml -f docker-compose.override.dev.yml exec moneywise-backend python manage.py migrate

# Shut down
docker-compose -f docker-compose.yml -f docker-compose.override.dev.yml down
```

#### Prod:

Create a backend-variables.env in the backend folder with your database variables.
```bash
DJANGO_SECRET_KEY=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE_NAME=
DB_HOST=
DB_PORT=
# Leave out `DEBUG` for prod
# DEBUG=
```

Then run the build job on the CICD pipeline. 

(Commands are same as Development, but replace `.dev.yml` with `.prod.yml`)
