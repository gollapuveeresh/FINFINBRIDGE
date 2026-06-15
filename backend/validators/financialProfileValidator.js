import Joi from 'joi';

export const financialProfileSchema = Joi.object({
  annualIncome: Joi.number().min(0).empty('').default(0),
  monthlyIncome: Joi.number().min(0).empty('').default(0),
  monthlyExpenses: Joi.number().min(0).empty('').default(0),
  savings: Joi.number().min(0).empty('').default(0),
  emergencyFund: Joi.number().min(0).empty('').default(0),
  creditScore: Joi.number().min(300).max(850).empty('').default(600),
  existingLoans: Joi.array().items(
    Joi.object({
      loanType: Joi.string().trim().required(),
      amount: Joi.number().min(0).empty('').default(0),
      monthlyPayment: Joi.number().min(0).empty('').default(0),
      _id: Joi.string().hex().length(24).optional()
    })
  ).default([]),
  totalLoanAmount: Joi.number().min(0).empty('').default(0),
  monthlyEMI: Joi.number().min(0).empty('').default(0),
  currentInvestments: Joi.number().min(0).empty('').default(0),
  riskTolerance: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
  investmentGoals: Joi.array().items(Joi.string().trim()).default([]),
  businessName: Joi.string().trim().allow('').default(''),
  businessType: Joi.string().trim().allow('').default(''),
  annualRevenue: Joi.number().min(0).empty('').default(0),
  annualExpenses: Joi.number().min(0).empty('').default(0),
  yearsInBusiness: Joi.number().min(0).empty('').default(0),
  assignedConsultant: Joi.string().hex().length(24).allow(null).optional()
});

