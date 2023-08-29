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
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`

Then, 
```
# In a terminal (at the root of the project)
docker-compose up OR docker compose up # Spins up the database 
# In another terminal
docker run --rm -it --network users-api_default -p "1212:1212" -v $PWD:/app --workdir /app node:18.8-alpine3.15 sh
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