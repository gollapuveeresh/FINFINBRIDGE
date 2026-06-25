import { useState, useEffect } from 'react';
import DepartmentAdminLayout from '../../layouts/DepartmentAdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CompletedMeetings() {
  const { user } = useAuth();
  const dept = user?.department || 'loans';

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  useEffect(() => {
    fetchCompletedMeetings();
  }, [dept]);

  const fetchCompletedMeetings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/consultations/completed-list');
      // The API returns a List of ConsultationResponse. Since it is a direct list, we check if it is an array.
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setMeetings(list);
    } catch (err) {
      toast.error('Failed to load completed consultations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      setVerifyingId(id);
      await api.post(`/consultations/${id}/verify-complete`);
      toast.success('Consultation verified successfully! Commission payout processed.');
      fetchCompletedMeetings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <DepartmentAdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent capitalize">{dept} — Completed Meetings</h1>
          <p className="text-text-muted text-sm mt-1">
            Review and verify client consultations completed by consultants to process commission payouts.
          </p>
        </div>
        <button 
          onClick={fetchCompletedMeetings} 
          className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm"
        >
          <span className="material-symbols-outlined text-base">refresh</span> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-gutter my-6">
        {[
          { 
            label: 'Awaiting Verification', 
            value: meetings.length, 
            color: 'text-amber-400', 
            bg: 'bg-amber-500/10',
            icon: 'pending_actions'
          },
          { 
            label: 'Department', 
            value: dept.toUpperCase(), 
            color: 'text-accent', 
            bg: 'bg-accent/10',
            icon: 'domain'
          },
          { 
            label: 'Standard Payout Rate', 
            value: '20% Commission', 
            color: 'text-green-400', 
            bg: 'bg-green-500/10',
            icon: 'payments'
          },
        ].map((k, i) => (
          <div key={i} className="card p-6 flex justify-between items-center">
            <div>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">{k.label}</p>
              <p className={`text-2xl font-bold mt-2 ${k.color}`}>{k.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${k.bg} shrink-0`}>
              <span className={`material-symbols-outlined ${k.color} text-[28px]`}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Completed Meetings Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface-hover-lowest">
          <h2 className="font-bold text-accent">Pending Verifications</h2>
        </div>
        {loading ? (
          <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold text-sm">Loading consultations...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="py-20 text-center text-text-muted">
            <span className="material-symbols-outlined text-[48px] text-text-faint">check_circle</span>
            <p className="mt-3 text-body-md font-semibold">No consultations awaiting verification.</p>
            <p className="text-xs mt-1 text-text-faint">All completed meetings have been verified and processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Consultant</th>
                  <th className="px-6 py-4">Service Category</th>
                  <th className="px-6 py-4">Meeting Slot</th>
                  <th className="px-6 py-4">Recording</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {meetings.map(c => (
                  <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-text">{c.clientId?.name || '—'}</p>
                      <p className="text-text-muted text-xs">{c.clientId?.email || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-text">{c.consultantId?.name || '—'}</p>
                      <p className="text-text-muted text-xs">{c.consultantId?.email || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-accent/10 text-accent font-semibold px-2.5 py-1 rounded-full">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-text-muted font-semibold">{c.confirmedDate || '—'}</p>
                      <p className="text-xs text-text-faint">{c.confirmedTime || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {c.recordingEnabled && c.videoUrl ? (
                        <button
                          onClick={() => setActiveVideoUrl(c.videoUrl)}
                          className="btn-ghost py-1 px-2.5 text-xs flex items-center gap-1 cursor-pointer border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all rounded-xl"
                        >
                          <span className="material-symbols-outlined text-[16px]">play_circle</span>
                          View Video
                        </button>
                      ) : (
                        <span className="text-xs text-text-muted italic">No Recording</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="status-badge status-warning flex items-center gap-1 w-max">
                        <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleVerify(c.id)}
                        disabled={verifyingId === c.id}
                        className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1 cursor-pointer bg-success text-white hover:bg-success/80 border-0 ml-auto"
                        style={{ backgroundColor: 'var(--color-status-success)' }}
                      >
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        {verifyingId === c.id ? 'Verifying...' : 'Verify & Pay'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Video Recording Modal */}
      {activeVideoUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border shadow-soft">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
              <h3 className="text-lg font-bold text-accent">Meeting Recording</h3>
              <button 
                onClick={() => setActiveVideoUrl(null)} 
                className="p-1 rounded-lg hover:bg-surface-hover text-text-muted cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border bg-black">
              <video src={activeVideoUrl} controls autoPlay className="w-full h-full" />
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setActiveVideoUrl(null)} 
                className="btn-ghost px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DepartmentAdminLayout>
  );
}
