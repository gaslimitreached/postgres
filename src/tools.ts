import { AST, Parser } from 'node-sql-parser';

const options = { database: 'postgresql' };

const parser = new Parser();

function astify(sql: string) {
  return parser.astify(sql, options);
}

function sqlify(ast: AST | AST[]) {
  return parser.sqlify(ast, options);
}

export function formatSql(sql: string) {
  return sqlify(astify(sql));
}
