import { Client } from 'pg';

export default async () => {
  const client = new Client({
    user: 'postgres',
    password: '123',
    host: 'localhost',
    port: '5432',
    database: 'Demo',
  });

  await client.connect();
  return client;
};