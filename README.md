# :busts_in_silhouette: Users API
This project allows to persist users preferences, queries and such.

## :nut_and_bolt: Development
This service needs to communicate to a PostgreSQL database. You can either communicate with a remote database or spin up one locally.
Best practices suggest to use docker && docker-compose. 

### :mortar_board: Pre-requisites
- Node 18+ (if using local node interpreter)
- Docker

### :runner: Run whole project
First, you need to have an `.env` file. With, minimally:
- `KEYCLOAK_URL`
- `KEYCLOAK_REALM`
- `KEYCLOAK_CLIENT`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` — the same values again, read by `node-pg-migrate` instead of by the app

:warning: Comments in `.env` must start with `#`. A line starting with `;` is skipped silently by `dotenv`, but makes `docker compose` refuse to parse the file at all.

Then, 
```
# In a terminal (at the root of the project)
docker-compose up OR docker compose up # Spins up the database 
# In another terminal
docker run --rm -it --network users-api_default -p "1212:1212" -v $PWD:/app --workdir /app node:16.13-alpine sh
npm install # if needed
npm run migrate up # if needed
npm run dev
```
Please note that you may need to tweak some parameters in the above commands according to your setup.
### :hammer: Run tests
```
docker run --rm -it --network users-api_default -p "1212:1212" -u node -v $PWD:/app --workdir /app node:18.8-alpine3.15 sh
npm run test
```
:warning: If you want to use `nodemon` make sure that you do not run your container as root (you could use `-u node`)
### :wrench: Update database schema

- Run `npm run migrate create <describe what you want to change>`, for example: `npm run migrate create add users email column`
- It creates a file `XXX_add-users-email-column.sql` in migrations directory
- Open it up and add your changes inside `-- Up Migration` directive and also add how to roll back these changes inside the `-- Down Migration` directive.

Example: 
```
-- Up Migration
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Down Migration
ALTER TABLE users DROP COLUMN email;
```

- Run `npm run migrate up`, it will apply your last changes.
- You need to rollback? Run `npm run migrate down`, it will roll back your last changes based on what you defined inside `-- Down Migration`.
- To rollback more than 1 migration, run `npm run migrate down {N}` where `N` is the number of migrations to rollback.

### :floppy_disk: Seed a local database

Two ways to get a usable database. Prefer the first — it needs no real data.

#### From the migrations

```
docker run --rm --name users-db -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=users postgres
```

`POSTGRES_DB` creates the database on first boot, so no `CREATE DATABASE` step is needed. Then, from another terminal, apply the schema with `npm run migrate up`.

#### From a QA dump

:warning: A dump contains real user records — keycloak ids, emails, saved filters. Keep it out of the repository and delete it when you are done with it.

```
# in one terminal
docker run --rm --name users-db -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=users postgres

# in another, from the directory holding the dump
docker exec -i users-db psql -U postgres -d users < usersapi_qa_kf.sql
```

Naming the container with `--name` saves looking its id up through `docker ps`, and piping the dump into `docker exec -i` saves copying it into the container first.

#### Pointing the app at it

With `-p 5432:5432` published, `DATABASE_HOST=localhost` works when node runs on the host. If node runs in its own container, either attach both to the same network and use the container name, or read the address off `docker inspect users-db`.

### :eyes: Access Postgres cli locally
Assuming that the postgres container is running and that you know its ID
```
docker exec -it <CONTAINER_ID> bash

# In the bash terminal run
psql postgres://<POSTGRES_USER>:<POSTGRES_PASSWORD>@<HOST>:<PORT>

# For example:
psql postgres://postgres:password@localhost:5432 
```
Here are some examples of useful commands
```
postgres=# \l
                                 List of databases
   Name    |  Owner   | Encoding |  Collate   |   Ctype    |   Access privileges   
-----------+----------+----------+------------+------------+-----------------------
 postgres  | postgres | UTF8     | en_US.utf8 | en_US.utf8 | 
 template0 | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
           |          |          |            |            | postgres=CTc/postgres
 template1 | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
           |          |          |            |            | postgres=CTc/postgres
 users     | postgres | UTF8     | en_US.utf8 | en_US.utf8 | 
(4 rows)
postgres=# \c users
You are now connected to database "users" as user "postgres".
users=# \dt
Did not find any relations.
users=# \q
```

## Github actions

### Trivy
Scans the dependencies and the built image for `HIGH` and `CRITICAL` vulnerabilities, and fails the pull request on any finding.

When it fails, triage in this order. The order is the point — starting further down the list forces versions that nobody upstream tested against:

1. **Attribute it** — `npm ls <package> --omit=dev` shows which dependency pulls it in.
2. **Check the declared range** — if the parent already allows the patched version, `npm update <package>` is enough, with no `package.json` change. This covers most findings, since they are usually a stale lockfile rather than a real conflict.
3. **Only if the range forbids it** — add an entry to `overrides` in `package.json`.
4. **Only if no fix is published** — add an entry to `.trivyignore.yaml`, with a justification and an `expired_at` date so it gets revisited.

Reproduce a CI failure locally with the same scanner version the action reports in its log:
```
docker run --rm -v "$PWD":/w -w /w aquasec/trivy:<version> \
  fs --scanners vuln --severity HIGH,CRITICAL --exit-code 1 .
```

### Shai-Hulud
This action check for the Shai-Hulud vulnerability.
It checks for:
- the vulnerability itself
- unallowed env var exposure
- malicious patterns

> ℹ️ You can acces the project repository to check the targeted patterns: https://github.com/sngular/shai-hulud-integrity-scanner/blob/9ecc202020ef894cef77449ba0c6972bb3f65979/scan-project.sh#L296 

To remove files that should be ignored by the action, edit the ```shai-hulud-check.sh``` script, to add the files path (in the dedicated section)

To be efficient, you should not remove code files, but parse them to remove allowed patterns. 
This can be achived by:
- adding the patterns in the ```shai-hulud-allowed-patterns.txt``` file (you must let an empty new line at the end of the file)
- adding the files by editing the ```shai-hulud-check.sh``` script, to add the files path (in the dedicated section) 

You can check if the scan is valid locally running the make target: ```make check```