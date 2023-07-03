import { Client, ClientConfig, Pool, PoolConfig } from 'pg';
import { getPostgresPassword } from './secretsmanager';
import { formatSql } from './tools';

const database = process.env.DATABASE_NAME as string;
const host = process.env.POSTGRES_URL as string;
const user = process.env.POSTGRES_USER as string;

function _createClient(clientConfig: ClientConfig) {
  return new Client(clientConfig);
}

async function _createDefaultClient() {
  return _createClient({
    host,
    user,
    database,
    port: 5432,
    password: await getPostgresPassword(),
    ssl: true,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _query(text: string, values?: any[] | undefined) {
  // node-postgres will sanitize the parameters before running the query.
  const client = await _createDefaultClient();

  try {
    await client.connect();
    return await client.query(formatSql(text), values);
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await client.end();
  }
}

export function createClient(connectionString?: string) {
  if (connectionString) return _createClient({ connectionString });

  return _createClient({
    connectionString: process.env.POSTGRES_URL_NON_POOLING as string,
  });
}

function _createPool(config: PoolConfig) {
  return new Pool(config);
}

export function createPool(connectionString?: string) {
  if (connectionString) return _createPool({ connectionString });

  return new Pool({
    host,
    user,
    idleTimeoutMillis: 10_000,
    max: 20,
    allowExitOnIdle: true,
    password: getPostgresPassword,
    ssl: true,
  });
}

// extract your parameters and adds them to an array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sql(strings: any, ...values: any) {
  const parts: string[] = strings as string[];

  try {
    // extract parameters and add them to an array if any
    let text = values.length ? '' : strings.join('');

    // make a parameterized representation to be passed to `pg`
    if (values.length) {
      values.forEach((_: unknown, index: number) => {
        text += `${parts[index]}${'$' + (index + 1)}`;
      });
      text += parts[parts.length - 1];
    }

    return await _query(text, values);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Invalid call to template literal');
    } else {
      throw error;
    }
  }
}

interface PostgresClient extends Client {
  sql: Function;
}

const db = {
  connect: async function (): Promise<PostgresClient> {
    const client = await _createDefaultClient();
    await client.connect();
    return {
      ...client,
      sql: module.exports.sql as Function,
    } as PostgresClient;
  },
  createPool: function (connectionString?: string): Pool {
    return createPool(connectionString);
  },
};

export { db };
