const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../utils/validation');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function toPublicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/register  (Citizens only self-register in the MVP;
// government officials are seeded/created by an admin process)
async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: 'CITIZEN' },
    });

    const token = signToken(user);
    res.status(201).json({ user: toPublicUser(user), token });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' });
    }

    const token = signToken(user);
    res.status(200).json({ user: toPublicUser(user), token });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/auth/me
async function updateMe(req, res, next) {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });
    res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/auth/password
async function changePassword(req, res, next) {
  try {
    const data = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user || !(await bcrypt.compare(data.currentPassword, user.passwordHash))) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Current password is incorrect',
      });
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });
    res.status(200).json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/auth/me (citizens only; reports remain public and become unlinked)
async function deleteMe(req, res, next) {
  try {
    if (req.user.role !== 'CITIZEN') {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Official accounts cannot be deleted through this endpoint',
      });
    }
    await prisma.user.delete({ where: { id: req.user.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, updateMe, changePassword, deleteMe };
