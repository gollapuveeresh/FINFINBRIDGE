import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { useAuth } from '../../context/AuthContext';
import { downloadPDFReport } from '../../utils/pdfGenerator';

export default function FinancialReports() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const profileRes = await api.get('/financial-profile');
      if (profileRes.data && profileRes.data.status === 'success') {
        setProfile(profileRes.data.data);
        
        try {
          const summaryRes = await api.get('/investments/summary');
          if (summaryRes.data && summaryRes.data.status === 'success') {
            setSummary(summaryRes.data.data);
          }
        } catch (sumErr) {
          console.error('Failed to fetch investments summary in reports:', sumErr);
        }

        try {
          const loansRes = await api.get('/loans');
          if (loansRes.data && loansRes.data.status === 'success') {
            setLoans(loansRes.data.data || []);
          }
        } catch (loansErr) {
          console.error('Failed to fetch loans in reports:', loansErr);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data in reports:', err);
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading reports ledger...</p>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-error/10 border border-error/25 text-error rounded-full flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-headline-md font-bold text-accent">Error Loading Reports</h2>
          <p className="text-body-md text-text-muted">{error}</p>
          <button onClick={fetchData} className="btn-primary mt-4">Retry</button>
        </div>
      </ClientLayout>
    );
  }

  // Profile Not Completed State
  if (!profile) {
    return (
      <ClientLayout>
        <div className="max-w-xl mx-auto text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-error/10 border border-error/25 text-error rounded-full flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-4xl">warning</span>
          </div>
          <h1 className="text-headline-lg font-bold text-accent">Profile Not Completed</h1>
          <p className="text-body-lg text-text-muted max-w-md mx-auto">
            You must complete your Financial Profile setup wizard before we can display your generated reports.
          </p>
          <Link to="/client/financial-profile">
            <button className="btn-primary mt-4 py-3 px-8 text-label-lg font-bold">
              Set Up Financial Profile
            </button>
          </Link>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Financial Reports</h1>
          <p className="text-body-md text-text-muted mt-1">Institutional-grade financial reports and analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter my-8">
        {/* Executive Report Card */}
        <div className="card p-8 flex flex-col justify-between hover:border-secondary transition-colors duration-250">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 bg-secondary/15 rounded-2xl flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-3xl font-bold">picture_as_pdf</span>
              </div>
              <span className="status-badge status-success">System Generated</span>
            </div>
            
            <div>
              <h3 className="text-headline-md font-bold text-accent">Executive Wealth & Portfolio Statement</h3>
              <p className="text-body-md text-text-muted mt-2">
                A print-ready, vectorized export of your complete asset allocation, personal liability listings, health metrics, and net worth overview.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-text-muted">
              <span>Format: <strong>Vector PDF</strong></span>
              <span>•</span>
              <span>Updated: <strong>Real-time</strong></span>
              <span>•</span>
              <span>Security: <strong>ISO 27001 Secure</strong></span>
            </div>
          </div>

          <div className="mt-8">
            <button 
              onClick={() => downloadPDFReport(profile, summary, loans, user)}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Download PDF Statement
            </button>
          </div>
        </div>

        {/* Informative placeholder card */}
        <div className="card p-8 flex flex-col justify-between border-dashed">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-surface-hover rounded-2xl flex items-center justify-center text-text-muted">
              <span className="material-symbols-outlined text-3xl">analytics</span>
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-text-muted">Quarterly Comparative Review</h3>
              <p className="text-body-md text-text-muted mt-2">
                Comparative period-over-period reviews are compiled at the end of every fiscal quarter by your assigned advisor.
              </p>
            </div>
          </div>
          <div className="mt-8 p-4 bg-surface rounded-xl border border-border text-center text-xs text-text-muted font-medium">
            Next generation scheduled for Q3 close.
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
