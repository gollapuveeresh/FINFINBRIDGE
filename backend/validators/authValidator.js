import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is required'
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email cannot be empty',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('client', 'consultant', 'admin', 'department-admin').default('client'),
  department: Joi.string().valid('loans', 'insurance', 'investment', 'investments', 'tax', 'wealth', 'platform').optional(),
  phone: Joi.string().trim().allow('').optional(),
  companyName: Joi.string().trim().allow('').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email cannot be empty',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required'
  })
});
