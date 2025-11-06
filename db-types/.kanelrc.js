const { makeKyselyHook } = require('kanel-kysely');

module.exports = {
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: '123456789',
    database: 'appointments'
  },
  preDeleteOutputFolder: true,
  outputPath: './src/db/schemas-kanel',
  preRenderHooks: [ makeKyselyHook() ],
  customTypeMap: {
    'pg_catalog.tsvector': 'string',
    'pg_catalog.bpchar': 'string',
  },
};
