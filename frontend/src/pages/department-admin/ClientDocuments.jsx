import DepartmentAdminLayout from '../../layouts/DepartmentAdminLayout';
import ClientDocuments from '../shared/ClientDocuments';

export default function DeptAdminClientDocuments() {
  return <ClientDocuments role="department-admin" Layout={DepartmentAdminLayout} />;
}
