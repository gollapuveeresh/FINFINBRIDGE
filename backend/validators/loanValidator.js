import Joi from 'joi';

export const createLoanSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional().messages({
    'string.length': 'Invalid Client User ID length'
  }),
  loanType: Joi.string().trim().required().messages({
    'string.empty': 'Loan type cannot be empty',
    'any.required': 'Loan type is required'
  }),
  lenderName: Joi.string().trim().required().messages({
    'string.empty': 'Lender name cannot be empty',
    'any.required': 'Lender name is required'
  }),
  principalAmount: Joi.number().min(0).required().messages({
    'number.min': 'Principal amount must be positive',
    'any.required': 'Principal amount is required'
  }),
  outstandingBalance: Joi.number().min(0).required().messages({
    'number.min': 'Outstanding balance must be positive',
    'any.required': 'Outstanding balance is required'
  }),
  interestRate: Joi.number().min(0).required().messages({
    'number.min': 'Interest rate must be positive',
    'any.required': 'Interest rate is required'
  }),
  tenureMonths: Joi.number().min(1).integer().required().messages({
    'number.min': 'Tenure must be at least 1 month',
    'any.required': 'Tenure in months is required'
  }),
  monthlyEMI: Joi.number().min(0).required().messages({
    'number.min': 'Monthly EMI must be positive',
    'any.required': 'Monthly EMI is required'
  }),
  startDate: Joi.date().required().messages({
    'any.required': 'Start date is required'
  }),
  endDate: Joi.date().required().messages({
    'any.required': 'End date is required'
  }),
  status: Joi.string().valid('Active', 'Closed', 'Closing Soon').default('Active'),
  notes: Joi.string().trim().allow('').default('')
});

export const updateLoanSchema = Joi.object({
  loanType: Joi.string().trim().optional(),
  lenderName: Joi.string().trim().optional(),
  principalAmount: Joi.number().min(0).optional(),
  outstandingBalance: Joi.number().min(0).optional(),
  interestRate: Joi.number().min(0).optional(),
  tenureMonths: Joi.number().min(1).integer().optional(),
  monthlyEMI: Joi.number().min(0).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  status: Joi.string().valid('Active', 'Closed', 'Closing Soon').optional(),
  notes: Joi.string().trim().allow('').optional()
});
