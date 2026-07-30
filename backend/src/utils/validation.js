const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createReportSchema = z.object({
  category: z.enum(['ROAD', 'SCHOOL', 'WATER', 'ELECTRICITY']),
  description: z.string().min(1).max(250),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

const updateStatusSchema = z.object({
  status: z.enum(['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED']),
});

module.exports = { registerSchema, loginSchema, createReportSchema, updateStatusSchema };
