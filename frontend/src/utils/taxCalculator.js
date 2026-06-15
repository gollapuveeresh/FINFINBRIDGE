/**
 * Shared utility for calculating estimated Indian income tax (New Tax Regime)
 */

export function calculateTax(taxableIncome) {
  if (!taxableIncome || taxableIncome <= 0) return 0;
  
  // Rebate under 87A: If taxable income does not exceed 7,00,000, tax liability is 0
  if (taxableIncome <= 700000) {
    return 0;
  }
  
  let tax = 0;
  
  // Slabs:
  // Up to 3,00,000: Nil
  // 3,00,001 to 7,00,000: 5% (max 20,000)
  // 7,00,001 to 10,00,000: 10% (max 30,000)
  // 10,00,001 to 12,00,000: 15% (max 30,000)
  // 12,00,001 to 15,00,000: 20% (max 60,000)
  // Above 15,00,000: 30%
  
  if (taxableIncome <= 300000) {
    return 0;
  }
  
  if (taxableIncome <= 700000) {
    tax += (taxableIncome - 300000) * 0.05;
  } else {
    tax += 400000 * 0.05; // 3L to 7L (20,000)
    
    if (taxableIncome <= 1000000) {
      tax += (taxableIncome - 700000) * 0.10;
    } else {
      tax += 300000 * 0.10; // 7L to 10L (30,000)
      
      if (taxableIncome <= 1200000) {
        tax += (taxableIncome - 1000000) * 0.15;
      } else {
        tax += 200000 * 0.15; // 10L to 12L (30,000)
        
        if (taxableIncome <= 1500000) {
          tax += (taxableIncome - 1200000) * 0.20;
        } else {
          tax += 300000 * 0.20; // 12L to 15L (60,000)
          tax += (taxableIncome - 1500000) * 0.30; // Above 15L
        }
      }
    }
  }
  
  // Health & Education Cess at 4%
  tax += tax * 0.04;
  
  return Math.round(tax);
}
