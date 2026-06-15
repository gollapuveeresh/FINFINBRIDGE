export const departmentLabels = {
  loans: 'Loans',
  insurance: 'Insurance',
  investments: 'Investments',
  tax: 'Tax Services',
  wealth: 'Wealth Management',
  platform: 'Platform',
};

const emailDepartmentMap = {
  'loans.admin@finbridge.com': 'loans',
  'insurance.admin@finbridge.com': 'insurance',
  'investments.admin@finbridge.com': 'investments',
  'tax.admin@finbridge.com': 'tax',
  'wealth.admin@finbridge.com': 'wealth',
  'consultant1@finbridge.com': 'loans',
  'consultant2@finbridge.com': 'loans',
  'consultant3@finbridge.com': 'insurance',
  'consultant4@finbridge.com': 'investments',
  'consultant5@finbridge.com': 'tax',
  'consultant6@finbridge.com': 'wealth',
};

export function getUserDepartment(user) {
  if (!user) return null;
  if (user.department) return user.department;
  return emailDepartmentMap[user.email?.toLowerCase()] || null;
}

export function getDepartmentDashboardPath(role, department) {
  const activeDepartment = department || 'loans';
  if (role === 'department-admin') {
    return `/department-admin/${activeDepartment}/dashboard`;
  }
  if (role === 'consultant') {
    return `/department-consultant/${activeDepartment}/dashboard`;
  }
  if (role === 'admin') return '/admin/dashboard';
  return '/client/dashboard';
}

export function canAccessDepartment(user, requiredDepartment) {
  if (!requiredDepartment) return true;
  return getUserDepartment(user) === requiredDepartment;
}
