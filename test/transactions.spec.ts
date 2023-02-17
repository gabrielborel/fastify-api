import {
  expect,
  test,
  beforeAll,
  afterAll,
  describe,
  beforeEach,
} from 'vitest';
import { execSync } from 'node:child_process';
import request from 'supertest';
import { app } from '../src/app';

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  test('user can create a new transaction', async () => {
    const res = await request(app.server).post('/transactions').send({
      title: 'Any title',
      amount: 5000,
      type: 'credit',
    });

    expect(res.statusCode).toBe(201);
  });

  test('user can list all transactions', async () => {
    const createTransactionRes = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Any title',
        amount: 5000,
        type: 'credit',
      });

    const cookies = createTransactionRes.get('Set-Cookie');

    const listTransactionsRes = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies);

    expect(listTransactionsRes.statusCode).toBe(200);
    expect(listTransactionsRes.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Any title',
        amount: 5000,
      }),
    ]);
  });

  test('user can list a transaction', async () => {
    const createTransactionRes = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Any title',
        amount: 5000,
        type: 'credit',
      });

    const cookies = createTransactionRes.get('Set-Cookie');

    const listTransactionsRes = await request(app.server)
      .get(`/transactions`)
      .set('Cookie', cookies);
    const transactionId = listTransactionsRes.body.transactions[0].id;

    const listTransactionByIdRes = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies);

    expect(listTransactionByIdRes.statusCode).toBe(200);
    expect(listTransactionByIdRes.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Any title',
        amount: 5000,
      })
    );
  });

  test('it should be able to get the summary', async () => {
    const createTransactionRes = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Any credit title',
        amount: 5000,
        type: 'credit',
      });

    const cookies = createTransactionRes.get('Set-Cookie');

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Any debit title',
        amount: 2000,
        type: 'debit',
      });

    const summaryRes = await request(app.server)
      .get(`/transactions/summary`)
      .set('Cookie', cookies);

    expect(summaryRes.statusCode).toBe(200);
    expect(summaryRes.body.summary).toEqual({
      amount: 3000,
    });
  });
});
