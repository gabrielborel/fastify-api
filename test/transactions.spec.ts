import { expect, test, beforeAll, afterAll, describe } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
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
});
