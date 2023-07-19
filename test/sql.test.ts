import { Client } from 'pg';

import { sql } from '../src';

jest.mock('pg', () => {
  const mock = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };

  return {
    Client: jest.fn(() => mock),
  };
});

jest.mock('@aws-sdk/rds-signer', () => {
  return {
    Signer: jest.fn(() => {
      return {
        getAuthToken: jest.fn(),
      };
    }),
  };
});

describe('sql', () => {
  let client: Client;

  beforeEach(() => {
    client = new Client();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('parameterizes insert statements', async () => {
    (client.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const [name, email] = ['firstname', 'firstname@email.com'];
    await sql`INSERT INTO users (name, email) VALUES (${name}, ${email})`;
    expect(client.connect).toBeCalledTimes(1);
    expect(client.query).toBeCalledTimes(1);
    expect(client.query).toBeCalledWith('INSERT INTO "users" ("name", "email") VALUES ($1,$2)', [name, email]);
    expect(client.end).toBeCalledTimes(1);
  });

  test('extract parameters and add to array', async () => {
    (client.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const likes = 12;
    await sql`SELECT * FROM posts WHERE likes > ${likes};`;
    // we want to expect that client dot query is called correctly;
    expect(client.connect).toBeCalledTimes(1);
    expect(client.query).toBeCalledTimes(1);
    expect(client.query).toBeCalledWith('SELECT * FROM "posts" WHERE "likes" > $1', [12]);
    expect(client.end).toBeCalledTimes(1);
  });

  test('can not call `sql` as function', async () => {
    await expect(sql('select * from posts')).rejects.toMatchObject({
      message: 'Invalid call to template literal',
    });
  });

  test('sql statement test cases', async () => {
    (client.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });
    const message = 'hello world';
    await sql`SELECT ${message}::text as message`;
    expect(client.query).toBeCalledWith('SELECT $1::TEXT AS "message"', [message]);
  });
});
