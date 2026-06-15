import Joi from 'joi';

const investmentTypes = [
  'Mutual Fund',
  'Stock',
  'Gold',
  'Fixed Deposit',
  'Real Estate',
  'ETF',
  'Bond',
  'Crypto',
  'PPF',
  'EPF',
  'NPS',
  'SIP',
  'ULIP',
  'Others'
];

export const createInvestmentSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional().messages({
    'string.length': 'Invalid Client User ID length'
  }),
  investmentType: Joi.string().valid(...investmentTypes).required().messages({
    'any.only': 'Invalid investment type',
    'any.required': 'Investment type is required'
  }),
  amountInvested: Joi.number().greater(0).required().messages({
    'number.greater': 'Amount invested must be greater than 0',
    'any.required': 'Amount invested is required'
  }),
  currentValue: Joi.number().min(0).required().messages({
    'number.min': 'Current value must be positive',
    'any.required': 'Current value is required'
  }),
  purchaseDate: Joi.date().required().messages({
    'any.required': 'Purchase date is required'
  }),
  riskLevel: Joi.string().valid('Low', 'Medium', 'High').required().messages({
    'any.only': 'Risk level must be Low, Medium, or High',
    'any.required': 'Risk level is required'
  }),
  notes: Joi.string().trim().allow('').default('')
});

export const updateInvestmentSchema = Joi.object({
  investmentType: Joi.string().valid(...investmentTypes).optional(),
  amountInvested: Joi.number().greater(0).optional(),
  currentValue: Joi.number().min(0).optional(),
  purchaseDate: Joi.date().optional(),
  riskLevel: Joi.string().valid('Low', 'Medium', 'High').optional(),
  notes: Joi.string().trim().allow('').optional()
});
