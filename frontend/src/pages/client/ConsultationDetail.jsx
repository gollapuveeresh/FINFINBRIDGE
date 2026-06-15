import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClientLayout from '../../layouts/ClientLayout';

export default function ConsultationDetail() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading session details...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="flex items-center gap-2 text-label-lg text-text-muted mb-6">
        <Link to="/client/consultations" className="hover:text-secondary transition-colors">Consultations</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-accent font-bold">Session Detail</span>
      </div>

      <div className="card p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
          <span className="material-symbols-outlined text-3xl">info_outline</span>
        </div>
        <div>
          <h3 className="text-headline-md font-bold text-accent">No Data Available Yet</h3>
          <p className="text-body-md text-text-muted mt-2">
            Detailed transcripts, action checklists, and documents are not available for this session.
          </p>
        </div>
        <Link to="/client/consultations">
          <button className="btn-primary mt-2">Back to Consultations</button>
        </Link>
      </div>
    </ClientLayout>
  );
}
