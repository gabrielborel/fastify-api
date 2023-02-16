import { randomUUID } from 'node:crypto';
import fastify from 'fastify';
import { knex } from './database';
import { env } from './env';

const app = fastify();

app.get('/hello', async () => {
  const transaction = await knex('transactions')
    .insert({
      id: randomUUID(),
      title: 'Any title',
      amount: 1000,
    })
    .returning('*');

  const transactions = await knex('transactions').select('*');

  return [transaction, transactions];
});

app
  .listen({ port: env.PORT })
  .then(() => console.log('Server is running on port 3333'))
  .catch(console.error);
