import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({});

export async function _getSecretById(
  secretId: string,
): Promise<string | undefined> {
  try {
    const { SecretString, SecretBinary } = await client.send(
      new GetSecretValueCommand({
        SecretId: secretId,
      }),
    );

    if (SecretString) return SecretString;

    if (SecretBinary)
      // eslint-disable-next-line curly
      return Buffer.from(SecretBinary.toString(), 'base64').toLocaleString();

    return;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

export async function getPostgresPassword(): Promise<string> {
  const secret = await _getSecretById(
    process.env.POSTGRES_SECRET_NAME as string,
  );

  const { password } = JSON.parse(secret ?? '{}');

  if (password === undefined)
    // eslint-disable-next-line curly
    throw Error('Could not find entry with that name. Does it exist?');

  return password as string;
}
