import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency as formatCurrencyINR } from '../../utils/currencyFormatter';

export default function FinancialProfile() {
  const navigate = useNavigate();
  const { checkProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [generalError, setGeneralError] = useState('');
  const [errorDetails, setErrorDetails] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State - initialized to empty strings instead of 0 for clean UX
  const [formData, setFormData] = useState({
    annualIncome: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    savings: '',
    emergencyFund: '',
    creditScore: 700,
    existingLoans: [],
    totalLoanAmount: '',
    monthlyEMI: '',
    businessName: '',
    businessType: '',
    annualRevenue: '',
    annualExpenses: '',
    yearsInBusiness: '',
    currentInvestments: '',
    riskTolerance: 'Medium',
    investmentGoals: []
  });

  // Loan Entry Temp State
  const [tempLoanType, setTempLoanType] = useState('');
  const [tempLoanAmount, setTempLoanAmount] = useState('');
  const [tempLoanEMI, setTempLoanEMI] = useState('');

  // Validation Errors
  const [validationErrors, setValidationErrors] = useState({});



  // Fetch Existing Profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/financial-profile');
      if (res.data && res.data.status === 'success') {
        const data = res.data.data;
        setFormData({
          ...data,
          annualIncome: data.annualIncome ?? '',
          monthlyIncome: data.monthlyIncome ?? '',
          monthlyExpenses: data.monthlyExpenses ?? '',
          savings: data.savings ?? '',
          emergencyFund: data.emergencyFund ?? '',
          creditScore: data.creditScore ?? '',
          totalLoanAmount: data.totalLoanAmount ?? '',
          monthlyEMI: data.monthlyEMI ?? '',
          annualRevenue: data.annualRevenue ?? '',
          annualExpenses: data.annualExpenses ?? '',
          yearsInBusiness: data.yearsInBusiness ?? '',
          currentInvestments: data.currentInvestments ?? '',
          businessName: data.businessName ?? '',
          businessType: data.businessType ?? '',
          riskTolerance: data.riskTolerance ?? 'Medium',
          existingLoans: data.existingLoans || [],
          investmentGoals: data.investmentGoals || []
        });
        setProfileExists(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setProfileExists(false); // No profile yet, show wizard
        setIsEditing(true);
      } else {
        setGeneralError('Failed to load financial profile.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Recalculate Loans Summary whenever existingLoans array changes
  useEffect(() => {
    const loans = formData.existingLoans || [];
    const totalAmount = loans.reduce((sum, loan) => sum + (Number(loan.amount) || 0), 0);
    const totalEMI = loans.reduce((sum, loan) => sum + (Number(loan.monthlyPayment) || 0), 0);
    setFormData(prev => ({
      ...prev,
      totalLoanAmount: totalAmount || '',
      monthlyEMI: totalEMI || ''
    }));
  }, [formData.existingLoans]);

  // Calculate Profile Completion Percentage
  const completionPercentage = (() => {
    const coreFields = [
      formData.annualIncome !== "" && Number(formData.annualIncome) > 0,
      formData.monthlyIncome !== "" && Number(formData.monthlyIncome) > 0,
      formData.monthlyExpenses !== "" && Number(formData.monthlyExpenses) > 0,
      formData.savings !== "" && Number(formData.savings) > 0,
      formData.emergencyFund !== "" && Number(formData.emergencyFund) > 0,
      formData.creditScore !== "" && Number(formData.creditScore) >= 300 && Number(formData.creditScore) <= 850,
      formData.currentInvestments !== "" && Number(formData.currentInvestments) > 0,
      !!formData.riskTolerance,
      (formData.investmentGoals || []).length > 0
    ];
    const completed = coreFields.filter(Boolean).length;
    return Math.round((completed / coreFields.length) * 100);
  })();

  // Unified number and text change handler
  const handleInputChange = (field, value) => {
    const numericFields = [
      'annualIncome', 'monthlyIncome', 'monthlyExpenses', 'savings', 'emergencyFund',
      'creditScore', 'totalLoanAmount', 'monthlyEMI', 'annualRevenue', 'annualExpenses',
      'yearsInBusiness', 'currentInvestments'
    ];
    let processedValue = value;
    if (numericFields.includes(field)) {
      processedValue = value === "" ? "" : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    // Clear validation error on change
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle Loan Add
  const handleAddLoan = () => {
    if (!tempLoanType || !tempLoanAmount || !tempLoanEMI) {
      setValidationErrors(prev => ({ ...prev, loans: 'Please fill out all loan details.' }));
      return;
    }
    const newLoan = {
      loanType: tempLoanType,
      amount: Number(tempLoanAmount),
      monthlyPayment: Number(tempLoanEMI)
    };
    setFormData(prev => ({
      ...prev,
      existingLoans: [...prev.existingLoans, newLoan]
    }));
    setTempLoanType('');
    setTempLoanAmount('');
    setTempLoanEMI('');
    setValidationErrors(prev => ({ ...prev, loans: null }));
  };

  // Handle Loan Remove
  const handleRemoveLoan = (index) => {
    setFormData(prev => ({
      ...prev,
      existingLoans: prev.existingLoans.filter((_, i) => i !== index)
    }));
  };

  // Handle Goal Checkbox Changes
  const handleGoalToggle = (goal) => {
    const goals = [...formData.investmentGoals];
    if (goals.includes(goal)) {
      setFormData(prev => ({
        ...prev,
        investmentGoals: goals.filter(g => g !== goal)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        investmentGoals: [...goals, goal]
      }));
    }
  };

  // Step Validation
  const validateStep = (stepNumber) => {
    const errors = {};
    if (stepNumber === 1) {
      if (formData.annualIncome === "") errors.annualIncome = 'Annual income is required.';
      else if (Number(formData.annualIncome) < 0) errors.annualIncome = 'Annual income must be positive.';
      
      if (formData.monthlyIncome === "") errors.monthlyIncome = 'Monthly income is required.';
      else if (Number(formData.monthlyIncome) < 0) errors.monthlyIncome = 'Monthly income must be positive.';
      
      if (formData.monthlyExpenses === "") errors.monthlyExpenses = 'Monthly expenses are required.';
      else if (Number(formData.monthlyExpenses) < 0) errors.monthlyExpenses = 'Monthly expenses must be positive.';
    } else if (stepNumber === 2) {
      if (formData.savings === "") errors.savings = 'Total savings is required.';
      else if (Number(formData.savings) < 0) errors.savings = 'Savings must be positive.';
      
      if (formData.emergencyFund === "") errors.emergencyFund = 'Emergency fund is required.';
      else if (Number(formData.emergencyFund) < 0) errors.emergencyFund = 'Emergency fund must be positive.';
      
      if (formData.creditScore === "") {
        errors.creditScore = 'Credit score is required.';
      } else if (Number(formData.creditScore) < 300 || Number(formData.creditScore) > 850) {
        errors.creditScore = 'Credit score must be between 300 and 850.';
      }
    } else if (stepNumber === 4) {
      if (formData.currentInvestments === "") errors.currentInvestments = 'Current investments value is required.';
      else if (Number(formData.currentInvestments) < 0) errors.currentInvestments = 'Investments must be positive.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Save / Submit Profile
  const handleSave = async (isDraft = false) => {
    if (!validateStep(currentStep)) return;

    try {
      setSubmitting(true);
      setGeneralError('');
      setErrorDetails([]);
      setSuccessMessage('');

      // Clean up formData numeric fields: empty strings should be 0
      const cleanedData = { ...formData };
      const numericFields = [
        'annualIncome', 'monthlyIncome', 'monthlyExpenses', 'savings', 'emergencyFund',
        'creditScore', 'totalLoanAmount', 'monthlyEMI', 'annualRevenue', 'annualExpenses',
        'yearsInBusiness', 'currentInvestments'
      ];
      numericFields.forEach(field => {
        if (cleanedData[field] === '' || cleanedData[field] == null) {
          cleanedData[field] = field === 'creditScore' ? 600 : 0;
        }
      });
      
      const stringFields = ['businessName', 'businessType'];
      stringFields.forEach(field => {
        if (cleanedData[field] == null) {
          cleanedData[field] = '';
        }
      });

      let response;
      if (profileExists) {
        // Update profile
        response = await api.put('/financial-profile', cleanedData);
      } else {
        // Create profile
        response = await api.post('/financial-profile', cleanedData);
      }

      if (response.data && response.data.status === 'success') {
        const data = response.data.data;
        setFormData({
          ...data,
          annualIncome: data.annualIncome ?? '',
          monthlyIncome: data.monthlyIncome ?? '',
          monthlyExpenses: data.monthlyExpenses ?? '',
          savings: data.savings ?? '',
          emergencyFund: data.emergencyFund ?? '',
          creditScore: data.creditScore ?? '',
          totalLoanAmount: data.totalLoanAmount ?? '',
          monthlyEMI: data.monthlyEMI ?? '',
          annualRevenue: data.annualRevenue ?? '',
          annualExpenses: data.annualExpenses ?? '',
          yearsInBusiness: data.yearsInBusiness ?? '',
          currentInvestments: data.currentInvestments ?? '',
        });
        setSuccessMessage(isDraft ? 'Draft saved successfully!' : 'Financial profile saved successfully!');
        setProfileExists(true);
        // Refresh AuthContext status
        await checkProfile();
        if (!isDraft) {
          // Redirect to Health Score overview after success
          setTimeout(() => {
            navigate('/client/health-score');
          }, 1500);
        } else {
          setIsEditing(false);
        }
      }
    } catch (err) {
      console.error(err);
      setGeneralError(err.response?.data?.message || 'Error occurred while saving your profile.');
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setErrorDetails(err.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading your financial data...</p>
        </div>
      </ClientLayout>
    );
  }

  // --- RENDERING WIZARD VIEW ---
  if (isEditing) {
    return (
      <ClientLayout>
        <div className="max-w-3xl mx-auto space-y-8 fade-in">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-headline-lg font-bold text-accent">Financial Profile Setup</h1>
              <p className="text-body-md text-text-muted mt-1">Provide details to calculate your financial health score.</p>
            </div>
            {profileExists && (
              <button 
                onClick={() => setIsEditing(false)}
                className="btn-ghost flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-lg">close</span> Cancel
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center text-label-lg font-bold">
              <span className="text-accent">Step {currentStep} of 4</span>
              <span className="text-secondary">{completionPercentage}% Completed</span>
            </div>
            <div className="h-2 bg-surface-hover-high rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {generalError && (
            <div className="p-4 bg-error/10 border border-error/25 text-error rounded-xl text-body-sm space-y-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">error</span>
                <span className="font-semibold">{generalError}</span>
              </div>
              {errorDetails && errorDetails.length > 0 && (
                <ul className="list-disc pl-8 space-y-1 text-xs">
                  {errorDetails.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-success/10 border border-success/25 text-success rounded-xl text-body-sm flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Wizard Steps Form */}
          <div className="card p-8 md:p-10 space-y-6">
            
            {/* STEP 1: PERSONAL FINANCE & BUSINESS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-headline-md font-bold text-accent border-b border-border pb-3">Income & Cash Flow</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Annual Income (₹)</label>
                    <input 
                      type="number"
                      value={formData.annualIncome ?? ""}
                      onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                      placeholder="Enter annual income in INR"
                      className="form-input"
                      required
                    />
                    {validationErrors.annualIncome && <p className="text-xs text-error">{validationErrors.annualIncome}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Monthly Income (₹)</label>
                    <input 
                      type="number"
                      value={formData.monthlyIncome ?? ""}
                      onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                      placeholder="Enter monthly income in INR"
                      className="form-input"
                      required
                    />
                    {validationErrors.monthlyIncome && <p className="text-xs text-error">{validationErrors.monthlyIncome}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Monthly Expenses (₹)</label>
                    <input 
                      type="number"
                      value={formData.monthlyExpenses ?? ""}
                      onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                      placeholder="Enter monthly expenses in INR"
                      className="form-input"
                      required
                    />
                    {validationErrors.monthlyExpenses && <p className="text-xs text-error">{validationErrors.monthlyExpenses}</p>}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <h4 className="font-bold text-accent text-body-md">Business Income (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-label-lg text-text-muted font-medium">Business Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={formData.businessName || ''}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-lg text-text-muted font-medium">Business Type</label>
                      <input 
                        type="text"
                        placeholder="e.g. LLC / Sole Proprietorship"
                        value={formData.businessType || ''}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-label-lg text-text-muted font-medium">Annual Revenue (₹)</label>
                      <input 
                        type="number"
                        value={formData.annualRevenue ?? ""}
                        onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                        placeholder="Enter business revenue in INR"
                        className="form-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-lg text-text-muted font-medium">Annual Expenses (₹)</label>
                      <input 
                        type="number"
                        value={formData.annualExpenses ?? ""}
                        onChange={(e) => handleInputChange('annualExpenses', e.target.value)}
                        placeholder="Enter business expenses in INR"
                        className="form-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-lg text-text-muted font-medium">Years in Business</label>
                      <input 
                        type="number"
                        value={formData.yearsInBusiness ?? ""}
                        onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                        placeholder="e.g. 3"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SAVINGS & CREDIT SCORE */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-headline-md font-bold text-accent border-b border-border pb-3">Liquidity & Credit</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Total Savings (₹)</label>
                    <input 
                      type="number"
                      value={formData.savings ?? ""}
                      onChange={(e) => handleInputChange('savings', e.target.value)}
                      placeholder="Enter total savings"
                      className="form-input"
                      required
                    />
                    {validationErrors.savings && <p className="text-xs text-error">{validationErrors.savings}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Emergency Fund (₹)</label>
                    <input 
                      type="number"
                      value={formData.emergencyFund ?? ""}
                      onChange={(e) => handleInputChange('emergencyFund', e.target.value)}
                      placeholder="Enter emergency fund amount"
                      className="form-input"
                      required
                    />
                    {validationErrors.emergencyFund && <p className="text-xs text-error">{validationErrors.emergencyFund}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Credit Score (300 - 850)</label>
                    <input 
                      type="number"
                      value={formData.creditScore ?? ""}
                      onChange={(e) => handleInputChange('creditScore', e.target.value)}
                      placeholder="e.g. 750"
                      className="form-input"
                      required
                    />
                    {validationErrors.creditScore && <p className="text-xs text-error">{validationErrors.creditScore}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LIABILITIES & EXISTING LOANS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-headline-md font-bold text-accent border-b border-border pb-3">Liabilities & Debts</h3>
                
                {/* Add new loan */}
                <div className="p-4 rounded-xl bg-surface border border-border space-y-4">
                  <h4 className="font-bold text-accent text-body-sm">Add Existing Loan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text"
                      placeholder="e.g. Mortgage / Student Loan"
                      value={tempLoanType}
                      onChange={(e) => setTempLoanType(e.target.value)}
                      className="form-input"
                    />
                    <input 
                      type="number"
                      placeholder="Remaining Amount (₹)"
                      value={tempLoanAmount ?? ""}
                      onChange={(e) => setTempLoanAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      className="form-input"
                    />
                    <input 
                      type="number"
                      placeholder="Monthly EMI (₹)"
                      value={tempLoanEMI ?? ""}
                      onChange={(e) => setTempLoanEMI(e.target.value === "" ? "" : Number(e.target.value))}
                      className="form-input"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddLoan}
                    className="btn-ghost py-2 text-xs flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Add Loan to Ledger
                  </button>
                  {validationErrors.loans && <p className="text-xs text-error">{validationErrors.loans}</p>}
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-accent text-body-md">Loan Ledger</h4>
                  {(!formData.existingLoans || formData.existingLoans.length === 0) ? (
                    <p className="text-body-sm text-text-muted italic">No current debts or loans logged.</p>
                  ) : (
                    <div className="divide-y divide-outline-variant/40 border border-border rounded-xl overflow-hidden">
                      {formData.existingLoans.map((loan, idx) => (
                        <div key={idx} className="p-4 bg-surface flex justify-between items-center">
                          <div>
                            <p className="font-bold text-accent">{loan.loanType}</p>
                            <p className="text-xs text-text-muted">{formatCurrencyINR(loan.amount)} balance</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-bold text-accent">{formatCurrencyINR(loan.monthlyPayment)}/mo</p>
                              <p className="text-[10px] text-text-muted font-medium">EMI</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleRemoveLoan(idx)}
                              className="text-error hover:text-red-700"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Debt Balance</span>
                    <p className="text-headline-md font-bold text-accent">{formatCurrencyINR(formData.totalLoanAmount)}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Monthly EMI Commitment</span>
                    <p className="text-headline-md font-bold text-secondary">{formatCurrencyINR(formData.monthlyEMI)}/mo</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: INVESTMENTS & INVESTMENT GOALS */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-headline-md font-bold text-accent border-b border-border pb-3">Investments & Goals</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Current Investments Value (₹)</label>
                    <input 
                      type="number"
                      value={formData.currentInvestments ?? ""}
                      onChange={(e) => handleInputChange('currentInvestments', e.target.value)}
                      placeholder="Enter current investment value"
                      className="form-input"
                      required
                    />
                    {validationErrors.currentInvestments && <p className="text-xs text-error">{validationErrors.currentInvestments}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Risk Tolerance Profile</label>
                    <select 
                      value={formData.riskTolerance}
                      onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
                      className="form-input"
                    >
                      <option value="Low">Low (Conservative, wealth preservation)</option>
                      <option value="Medium">Medium (Balanced growth & security)</option>
                      <option value="High">High (Aggressive portfolio expansion)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-label-lg text-accent font-bold block">Financial & Investment Goals</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Retirement Security', 'Real Estate/Home Purchase', 'Education Savings', 'Wealth Accumulation', 'Tax Reduction Strategic', 'Business Seed Capital'].map((goal) => {
                      const checked = (formData.investmentGoals || []).includes(goal);
                      return (
                        <label key={goal} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          checked ? 'bg-secondary/10 border-secondary' : 'bg-surface border-border/50 hover:bg-surface'
                        }`}>
                          <input 
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleGoalToggle(goal)}
                            className="w-4 h-4 rounded text-secondary"
                          />
                          <span className="text-body-sm font-semibold text-accent">{goal}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-border">
              <div>
                {currentStep > 1 && (
                  <button 
                    type="button"
                    onClick={handleBack}
                    className="btn-ghost flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span> Back
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => handleSave(true)}
                  disabled={submitting}
                  className="btn-ghost text-secondary px-6"
                >
                  Save Draft
                </button>
                {currentStep < 4 ? (
                  <button 
                    type="button" 
                    onClick={handleNext}
                    className="btn-primary"
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => handleSave(false)}
                    disabled={submitting}
                    className="btn-primary"
                  >
                    {submitting ? 'Saving...' : 'Submit Profile'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </ClientLayout>
    );
  }

  // --- RENDERING OVERVIEW / BALANCE SHEET VIEW ---
  const totalAssets = Number(formData.savings) + Number(formData.currentInvestments);
  const totalLiabilities = Number(formData.totalLoanAmount);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <ClientLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Financial Profile & Balance Sheet</h1>
          <p className="text-body-md text-text-muted mt-1">Aggregated ledger representing total net worth, cash flows, and assets.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Modify Profile
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-success/10 border border-success/25 text-success rounded-xl text-body-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Net Worth Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {[
          { label: 'Aggregated Net Worth', value: netWorth, desc: 'Assets minus Liabilities', icon: 'shield_with_heart', color: 'bg-accent/10 text-accent' },
          { label: 'Combined System Assets', value: totalAssets, desc: 'Savings + Investments', icon: 'account_balance_wallet', color: 'bg-success/15 text-success' },
          { label: 'Combined Liabilities', value: totalLiabilities, desc: 'All outstanding debt', icon: 'trending_down', color: 'bg-error/10 text-error' },
        ].map((kpi, i) => (
          <div key={i} className="card p-6 flex items-center gap-5 relative overflow-hidden">
            <div className={`p-3 rounded-xl ${kpi.color.split(' ')[0]}`}>
              <span className={`material-symbols-outlined ${kpi.color.split(' ')[1]}`}>{kpi.icon}</span>
            </div>
            <div>
              <p className="text-text-muted text-label-lg">{kpi.label}</p>
              <p className="text-headline-md font-bold text-accent mt-1">
                {formatCurrencyINR(kpi.value)}
              </p>
              <p className="text-xs text-text-muted mt-1">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ledger Lists: Assets vs Liabilities */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        {/* Assets Ledger */}
        <div className="xl:col-span-6 card overflow-hidden">
          <div className="px-8 py-5 border-b border-border flex justify-between items-center bg-surface-hover-lowest">
            <h3 className="text-headline-md font-bold text-accent flex items-center gap-2">
              <span className="material-symbols-outlined text-success">add_circle</span> Asset Portfolio Ledger
            </h3>
            <span className="text-xs px-2.5 py-1 bg-success/10 text-success rounded-full font-bold">
              SUM: {formatCurrencyINR(totalAssets)}
            </span>
          </div>
          <div className="divide-y divide-outline-variant/40">
            <div className="p-6 flex justify-between items-center hover:bg-surface/30 transition-colors">
              <div>
                <h4 className="font-bold text-accent">Liquid Savings</h4>
                <p className="text-xs text-text-muted mt-1">Liquid cash reserves & emergency holdings</p>
              </div>
              <p className="text-body-md font-bold text-accent">{formatCurrencyINR(formData.savings)}</p>
            </div>
            <div className="p-6 flex justify-between items-center hover:bg-surface/30 transition-colors">
              <div>
                <h4 className="font-bold text-accent">Investment Portfolio</h4>
                <p className="text-xs text-text-muted mt-1">Equities, bonds, and mutual funds</p>
              </div>
              <p className="text-body-md font-bold text-accent">{formatCurrencyINR(formData.currentInvestments)}</p>
            </div>
            <div className="p-6 flex justify-between items-center hover:bg-surface/30 transition-colors">
              <div>
                <h4 className="font-bold text-accent">Emergency Buffer</h4>
                <p className="text-xs text-text-muted mt-1">Designated crisis fund</p>
              </div>
              <p className="text-body-md font-bold text-accent">{formatCurrencyINR(formData.emergencyFund)}</p>
            </div>
          </div>
        </div>

        {/* Liabilities Ledger */}
        <div className="xl:col-span-6 card overflow-hidden">
          <div className="px-8 py-5 border-b border-border flex justify-between items-center bg-surface-hover-lowest">
            <h3 className="text-headline-md font-bold text-accent flex items-center gap-2">
              <span className="material-symbols-outlined text-error">remove_circle</span> Debt & Liabilities Ledger
            </h3>
            <span className="text-xs px-2.5 py-1 bg-error/10 text-error rounded-full font-bold">
              SUM: {formatCurrencyINR(totalLiabilities)}
            </span>
          </div>
          <div className="divide-y divide-outline-variant/40">
            {(!formData.existingLoans || formData.existingLoans.length === 0) ? (
              <div className="p-8 text-center text-text-muted italic">No debts found.</div>
            ) : (
              formData.existingLoans.map((loan, idx) => (
                <div key={idx} className="p-6 flex justify-between items-center hover:bg-surface/30 transition-colors">
                  <div>
                    <h4 className="font-bold text-accent">{loan.loanType}</h4>
                    <p className="text-xs text-text-muted mt-1">Outstanding active credit line</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-md font-bold text-accent">{formatCurrencyINR(loan.amount)}</p>
                    <p className="text-xs text-error font-medium">-{formatCurrencyINR(loan.monthlyPayment)}/mo</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Income & Inflow-Outflow Flow Chart */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Income Streams */}
        <div className="col-span-12 lg:col-span-7 card p-8">
          <h3 className="text-headline-md font-bold text-accent mb-6">Annual Recurring Income Channels</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border/40">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-accent">payments</span>
                  <div>
                    <p className="font-bold text-accent text-body-md">Annual Personal Salary</p>
                    <p className="text-xs text-text-muted">Primary Wages</p>
                  </div>
                </div>
                <span className="text-label-lg font-bold text-success">{formatCurrencyINR(formData.annualIncome)}</span>
              </div>
            </div>
            {formData.businessName && (
              <div className="p-4 rounded-xl border border-border/40">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent">store</span>
                    <div>
                      <p className="font-bold text-accent text-body-md">{formData.businessName} ({formData.businessType})</p>
                      <p className="text-xs text-text-muted">Corporate Revenue • {formData.yearsInBusiness} yrs</p>
                    </div>
                  </div>
                  <span className="text-label-lg font-bold text-success">{formatCurrencyINR(formData.annualRevenue)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expenses & Outflows summary */}
        <div className="col-span-12 lg:col-span-5 card p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-headline-md font-bold text-accent mb-6">Monthly Commitments</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-body-md">
                <span>Monthly Living Expenses</span>
                <span className="font-bold text-accent">{formatCurrencyINR(formData.monthlyExpenses)}</span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span>Monthly Debt Service (EMI)</span>
                <span className="font-bold text-accent">{formatCurrencyINR(formData.monthlyEMI)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
            <div>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Credit Profile Rating</p>
              <p className="text-headline-md font-bold text-accent">{formData.creditScore} / 850</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-label-lg ${
              formData.creditScore >= 740 ? 'bg-success/10 text-success' : formData.creditScore >= 670 ? 'bg-secondary/15 text-secondary' : 'bg-error/10 text-error'
            }`}>
              {formData.creditScore >= 740 ? 'Excellent' : formData.creditScore >= 670 ? 'Good' : 'Needs Work'}
            </div>
          </div>
        </div>
      </div>

      {/* Investment Profile Goals Summary */}
      <div className="card p-8">
        <h3 className="text-headline-md font-bold text-accent mb-6">Investment & Strategic Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border/50 bg-surface">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Risk Tolerance Profile</span>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-2xl">insights</span>
              <p className="text-headline-md font-bold text-accent">{formData.riskTolerance} Risk Profile</p>
            </div>
          </div>
          <div className="p-6 rounded-xl border border-border/50 bg-surface space-y-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Target Goals Selected</span>
            {(!formData.investmentGoals || formData.investmentGoals.length === 0) ? (
              <p className="text-body-sm text-text-muted italic">No investment goals specified.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.investmentGoals.map((goal, i) => (
                  <span key={i} className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-bold">{goal}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
