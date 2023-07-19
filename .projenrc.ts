import { typescript } from 'projen';
import { NpmAccess } from 'projen/lib/javascript';

const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  deps: ['pg', 'node-sql-parser', '@aws-sdk/rds-signer'],
  devDeps: ['@types/pg', 'typescript'],
  description: 'Interact with your AWS RDS Proxy (Postgres)',
  name: '@cachemonet/postgres',
  npmAccess: NpmAccess.PUBLIC,
  projenrcTs: true,
  releaseToNpm: true,
  repository: 'https://github.com/gaslimitreached/postgres.git',
  tsconfig: {
    compilerOptions: {
      lib: ['dom'],
    },
  },
});

project.synth();
