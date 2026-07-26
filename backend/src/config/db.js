const { PrismaClient } = require('@prisma/client');

// Reuse a single Prisma instance across the app (avoids exhausting DB
// connections in dev when nodemon hot-reloads).
const prisma = new PrismaClient();

module.exports = prisma;
