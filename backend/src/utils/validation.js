const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const reportFields = {
  category: z.enum(['ROAD', 'SCHOOL', 'WATER', 'ELECTRICITY']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(1).max(250),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  title: z.string().max(140).optional(),
  lga: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  reporterName: z.string().max(100).optional(),
  reporterContact: z.string().max(100).optional(),
};

const createReportSchema = z.object(reportFields);

const updateReportSchema = z.object({
  category: reportFields.category.optional(),
  severity: reportFields.severity.optional(),
  description: reportFields.description.optional(),
  latitude: reportFields.latitude.optional(),
  longitude: reportFields.longitude.optional(),
  title: reportFields.title,
  lga: reportFields.lga,
  state: reportFields.state,
  address: reportFields.address,
  reporterName: reportFields.reporterName,
  reporterContact: reportFields.reporterContact,
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one report field must be supplied',
});

const updateStatusSchema = z.object({
  status: z.enum(['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED']),
  note: z.string().max(500).optional(),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  defaultAnonymous: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one profile field must be supplied',
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

module.exports = {
  registerSchema,
  loginSchema,
  createReportSchema,
  updateReportSchema,
  updateStatusSchema,
  updateProfileSchema,
  changePasswordSchema,
};
