import Joi from 'joi';

const loanTypes = ['Personal Loan', 'Home Loan', 'Car Loan', 'Education Loan', 'Business Loan', 'Gold Loan'];

export const createLoanProductSchema = Joi.object({
  bankName: Joi.string().trim().required().messages({
    'any.required': 'Bank name is required',
    'string.empty': 'Bank name cannot be empty'
  }),
  loanType: Joi.string().valid(...loanTypes).required().messages({
    'any.required': 'Loan type is required',
    'any.only': 'Loan type must be one of: ' + loanTypes.join(', ')
  }),
  minCreditScore: Joi.number().integer().min(300).max(850).required().messages({
    'any.required': 'Minimum credit score is required',
    'number.min': 'Minimum credit score is 300',
    'number.max': 'Minimum credit score cannot exceed 850'
  }),
  maxCreditScore: Joi.number().integer().min(300).max(850).required().messages({
    'any.required': 'Maximum credit score is required',
    'number.min': 'Maximum credit score is 300',
    'number.max': 'Maximum credit score cannot exceed 850'
  }),
  minMonthlyIncome: Joi.number().min(0).required().messages({
    'any.required': 'Minimum monthly income is required',
    'number.min': 'Minimum monthly income must be positive'
  }),
  maxLoanAmount: Joi.number().min(0).required().messages({
    'any.required': 'Maximum loan amount is required',
    'number.min': 'Maximum loan amount must be positive'
  }),
  interestRate: Joi.number().min(0).required().messages({
    'any.required': 'Interest rate is required',
    'number.min': 'Interest rate must be positive'
  }),
  processingFee: Joi.number().min(0).required().messages({
    'any.required': 'Processing fee is required',
    'number.min': 'Processing fee must be positive'
  }),
  tenureMonths: Joi.number().integer().min(1).required().messages({
    'any.required': 'Tenure in months is required',
    'number.min': 'Tenure must be at least 1 month'
  }),
  description: Joi.string().trim().allow('').optional(),
  features: Joi.array().items(Joi.string().trim()).optional(),
  eligibilityCriteria: Joi.string().trim().allow('').optional(),
  bankLogo: Joi.string().trim().allow('').optional(),
  officialWebsite: Joi.string().trim().allow('').optional(),
  preApproved: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional()
});

export const updateLoanProductSchema = Joi.object({
  bankName: Joi.string().trim().optional(),
  loanType: Joi.string().valid(...loanTypes).optional(),
  minCreditScore: Joi.number().integer().min(300).max(850).optional(),
  maxCreditScore: Joi.number().integer().min(300).max(850).optional(),
  minMonthlyIncome: Joi.number().min(0).optional(),
  maxLoanAmount: Joi.number().min(0).optional(),
  interestRate: Joi.number().min(0).optional(),
  processingFee: Joi.number().min(0).optional(),
  tenureMonths: Joi.number().integer().min(1).optional(),
  description: Joi.string().trim().allow('').optional(),
  features: Joi.array().items(Joi.string().trim()).optional(),
  eligibilityCriteria: Joi.string().trim().allow('').optional(),
  bankLogo: Joi.string().trim().allow('').optional(),
  officialWebsite: Joi.string().trim().allow('').optional(),
  preApproved: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional()
});
