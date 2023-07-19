# Postgres

`@cachemonet/postgres` provides a way to interact with Postgres database behind an AWS RDS Proxy. The following are exported:

- `sql`
- `db`
- `createClient`

## `sql`

Construct SQL queries with the `sql` [template literal tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates). The statement is translated into a native parameterized query to help [prevent SQL injections](https://node-postgres.com/features/queries#parameterized-query).

The AWS RDS Proxy creates a [pooled database connection](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/rds-proxy.howitworks.html#rds-proxy-connection-pooling) for you and connects to the database specefied in the `process.env.POSTGRES_URL` environment variable.

```javascript
import { sql } from '@cachemonet/postgres';

const likes = 100;
const { rows, fields } = await sql`SELECT * FROM posts WHERE likes > ${likes}`;
```

You can't call `sql` like a regular function. Attempting to do so will throw an error. This is a security measure to prevent the possibility of SQL injections.

`sql` expects permissions to connect to the AWS Proxy as the user specefied in the `process.env.POSTGRES_USER` environment variable and that the runtime environment is allowed to get the secret specefied in the `process.env.POSTGRES_SECRET_NAME`.

The `POSTGRES_SECRET_NAME` is the secret full arn for the database and is stored as either a secret string or secret binary in the shape of:

`{ "username": "alice", "password": "secret" }`.

### Withoug AWS RDS Proxy

Fork this lib and replace the internals of `_createClient` or `getPostgressPassword`. Please consider the security of your database when making any changes.


## `db`

You can use `db` to create a connection to your database (pooled). AWS RDS Proxy will automatically manage connections to the database.

```javascript
import { db } from '@cachemonet/postgres'; 

const client = await db.connect();
await client.query('SELECT 1');
```

Creating a client is preferred over the `sql` helper if you need to make multiple queries or want to run transactions, as `sql` will connect for every query.

If you want to connect to the non-default database using an Environment Variable, you can use the `createPool()` method with the `connectionString` parameter. The pool returned from `createPool` is an instance of the `Pool` class from `node-postgres`.

## `createClient()`

The client returned from `createClient` is an instance of the `Client` class from `node-postgres` and does not support the `sql`.

## Using an ORM

Not yet.

## Security

Do not use `@cachemonet/postgres` in public-facing clients. Doing so could expose your database URL and other information. If using AWS RDS Proxy you will need to be in the VPC and appropriate security group. Only use on the server.

Always use parameterized queries, an ORM, or query builder when creating queries with user-defined inputs to minimize the likelihood of SQL injection attacks. The `sql` function in the `@cachemonet/postgres` package translates raw queries to parameterized queries for you.
