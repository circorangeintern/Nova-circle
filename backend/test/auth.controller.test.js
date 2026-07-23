const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { invoke, mockCommonJsModule } = require('./helpers/controller');

process.env.JWT_SECRET = 'test-secret-that-is-long-enough';
process.env.JWT_EXPIRES_IN = '1h';

const prisma = {
  user: {
    create: async () => {
      throw new Error('Unexpected user.create call');
    },
    findUnique: async () => null,
  },
};

mockCommonJsModule(require.resolve('../src/config/db'), prisma);
const { register, login } = require('../src/controllers/auth.controller');

test('register hashes the password, normalizes the email, and issues a citizen JWT', async () => {
  let createInput;
  prisma.user.create = async ({ data }) => {
    createInput = data;
    return {
      id: 'citizen-1',
      ...data,
      defaultAnonymous: true,
      createdAt: new Date('2026-07-23T10:00:00.000Z'),
      updatedAt: new Date('2026-07-23T10:00:00.000Z'),
    };
  };

  const res = await invoke(register, {
    body: {
      name: '  Ada Obi  ',
      email: '  ADA@Example.COM ',
      password: 'strong-password',
    },
  });

  assert.equal(res.statusCode, 201);
  assert.equal(createInput.name, 'Ada Obi');
  assert.equal(createInput.email, 'ada@example.com');
  assert.equal(createInput.role, 'CITIZEN');
  assert.notEqual(createInput.passwordHash, 'strong-password');
  assert.equal(await bcrypt.compare('strong-password', createInput.passwordHash), true);
  assert.equal(res.body.user.passwordHash, undefined);
  const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
  assert.equal(payload.id, 'citizen-1');
  assert.equal(payload.role, 'CITIZEN');
  assert.equal(typeof payload.iat, 'number');
  assert.equal(typeof payload.exp, 'number');
});

test('login accepts a valid password and rejects an invalid password', async () => {
  const passwordHash = await bcrypt.hash('correct-password', 4);
  prisma.user.findUnique = async ({ where }) => ({
    id: 'official-1',
    name: 'Works Officer',
    email: where.email,
    passwordHash,
    role: 'GOVERNMENT_OFFICIAL',
    jurisdiction: 'Surulere',
  });

  const accepted = await invoke(login, {
    body: { email: 'OFFICIAL@EXAMPLE.COM', password: 'correct-password' },
  });
  assert.equal(accepted.statusCode, 200);
  assert.equal(accepted.body.user.role, 'GOVERNMENT_OFFICIAL');
  assert.equal(jwt.verify(accepted.body.token, process.env.JWT_SECRET).id, 'official-1');

  const rejected = await invoke(login, {
    body: { email: 'official@example.com', password: 'wrong-password' },
  });
  assert.equal(rejected.statusCode, 401);
  assert.equal(rejected.body.error, 'INVALID_CREDENTIALS');
});
