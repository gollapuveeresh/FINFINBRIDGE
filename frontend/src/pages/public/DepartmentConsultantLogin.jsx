import ConsultantLogin from './ConsultantLogin';

export default function DepartmentConsultantLogin() {
  return (
    <ConsultantLogin
      portalLabel="Department Consultant Desk"
      heading="Department Consultant Sign In"
      description="Access your assigned department clients, cases, and advisory schedule."
      emailLabel="Department Consultant Email"
      emailPlaceholder="consultant1@finbridge.com"
      submitLabel="Sign In to Department Desk"
    />
  );
}
