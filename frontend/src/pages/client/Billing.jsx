import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';

export default function BillingSubscription() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/financial-profile');
      if (res.data && res.data.status === 'success') {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile in billing:', err);
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
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading billing details...</p>
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
          <h2 className="text-headline-md font-bold text-accent">Error Loading Billing</h2>
          <p className="text-body-md text-text-muted">{error}</p>
          <button onClick={fetchProfile} className="btn-primary mt-4">Retry</button>
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
            You must complete your Financial Profile setup wizard before we can display your billing settings.
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
      <div>
        <h1 className="text-headline-lg font-bold text-accent">Billing & Subscription</h1>
        <p className="text-body-md text-text-muted mt-1">Manage your plan, invoices, and payment methods.</p>
      </div>

      <div className="card p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
          <span className="material-symbols-outlined text-3xl">credit_card_off</span>
        </div>
        <div>
          <h3 className="text-headline-md font-bold text-accent">No Data Available Yet</h3>
          <p className="text-body-md text-text-muted mt-2">
            No active subscriptions, premium plan structures, or payment invoices are currently active.
          </p>
        </div>
      </div>
    </ClientLayout>
  );
}
