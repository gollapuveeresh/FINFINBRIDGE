import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { useAuth } from '../../context/AuthContext';

const SERVICES = [
  { value: 'loans', label: 'Loans' },
  { value: 'tax', label: 'Tax Planning' },
  { value: 'investment', label: 'Investments' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'wealth', label: 'Wealth Management' },
];

export default function Consultations() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Form State
  const [showBookForm, setShowBookForm] = useState(false);
  const [category, setCategory] = useState('General Consultation');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    if (user?.department && !department) {
      setDepartment(user.department);
    }
  }, [user]);

  const fetchProfileAndConsultations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch profile
      try {
        const profileRes = await api.get('/financial-profile');
        if (profileRes.data && profileRes.data.status === 'success') {
          setProfile(profileRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile in consultations:', err);
        if (err.response?.status === 404) {
          setProfile(null);
        } else {
          throw err;
        }
      }

      // Fetch consultations
      const consultationsRes = await api.get('/consultations');
      if (consultationsRes.data && consultationsRes.data.status === 'success') {
        setConsultations(consultationsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load consultation data:', err);
      setError(err.response?.data?.message || 'Failed to load consultation data.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!department) {
      alert('Please select a service before requesting a consultation.');
      return;
    }
    try {
      setBooking(true);
      const res = await api.post('/consultations', {
        category,
        department,
        clientNotes: notes
      });
      if (res.data && res.data.status === 'success') {
        setBookingSuccess('Your request has been received and is pending assignment by the department admin.');
        setNotes('');
        setShowBookForm(false);
        
        // Refresh consultations list
        const consultationsRes = await api.get('/consultations');
        if (consultationsRes.data && consultationsRes.data.status === 'success') {
          setConsultations(consultationsRes.data.data);
        }
        
        setTimeout(() => setBookingSuccess(''), 6000);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to book consultation');
    } finally {
      setBooking(false);
    }
  };

  useEffect(() => {
    fetchProfileAndConsultations();
  }, []);

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading consultations...</p>
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
          <h2 className="text-headline-md font-bold text-accent">Error Loading Consultations</h2>
          <p className="text-body-md text-text-muted">{error}</p>
          <button onClick={fetchProfileAndConsultations} className="btn-primary mt-4">Retry</button>
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
            You must complete your Financial Profile setup wizard before we can display your advisor configurations.
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

  const consultant = profile.assignedConsultant;

  return (
    <ClientLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Consultations</h1>
          <p className="text-body-md text-text-muted mt-1">Schedule and manage your advisory sessions.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowBookForm(!showBookForm)} 
            className="btn-primary flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add_circle</span>
            {showBookForm ? 'Cancel Booking' : 'Book Expert'}
          </button>
        </div>
      </div>

      {bookingSuccess && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-body-md font-bold flex items-center gap-2 fade-in">
          <span className="material-symbols-outlined">check_circle</span>
          {bookingSuccess}
        </div>
      )}

      {/* Book Consultant Form */}
      {showBookForm && (
        <div className="card p-8 space-y-6 border border-secondary/35 bg-surface-hover-lowest fade-in">
          <h3 className="text-headline-md font-bold text-accent">Request Advisor Session</h3>
          <form onSubmit={handleBook} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-label-sm font-bold text-accent block mb-2">Service / Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-body-md text-accent focus:outline-none focus:border-secondary font-semibold"
                >
                  <option value="" disabled>Select a service</option>
                  {SERVICES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-label-sm font-bold text-accent block mb-2">Select Consultation Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-body-md text-accent focus:outline-none focus:border-secondary font-semibold"
                >
                  <option value="General Consultation">General Consultation</option>
                  <option value="Portfolio Restructuring">Portfolio Restructuring</option>
                  <option value="Tax Strategy Sync">Tax Strategy Sync</option>
                  <option value="Loan Refinancing Analysis">Loan Refinancing Analysis</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-label-sm font-bold text-accent block mb-2">Notes & Objectives (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What details or objectives do you want to cover with the expert?"
                rows="3"
                className="w-full bg-surface border border-border rounded-xl p-4 text-body-md text-accent focus:outline-none focus:border-secondary"
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={booking}
              className="btn-primary py-3 px-6 text-label-lg font-bold flex items-center gap-2"
            >
              {booking ? 'Submitting Booking...' : 'Confirm Session Request'}
            </button>
          </form>
        </div>
      )}

      {/* Advisor Assignment Banner */}
      <div className="card p-6 border border-secondary/30 bg-accent/20/20">
        {consultant ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center text-secondary font-black text-xl shrink-0">
                {consultant.name ? consultant.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <p className="text-label-sm text-secondary font-bold uppercase tracking-wider">Your Assigned Advisor</p>
                <h3 className="text-headline-md font-bold text-accent">{consultant.name}</h3>
                <p className="text-body-sm text-text-muted mt-1">
                  Email: {consultant.email} {consultant.phone && `• Phone: ${consultant.phone}`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <a href={`mailto:${consultant.email}`} className="btn-ghost flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined">mail</span>Email Advisor
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-error/10 rounded-xl flex items-center justify-center text-error shrink-0">
                <span className="material-symbols-outlined text-2xl">person_off</span>
              </div>
              <div>
                <p className="text-label-sm text-error font-bold uppercase tracking-wider">Advisor Assignment</p>
                <h3 className="text-headline-md font-bold text-accent">No Consultant Assigned Yet</h3>
                <p className="text-body-sm text-text-muted mt-1">Once you request a consultation, the department admin will review your request and assign a consultant to you.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Consultations List */}
      <div className="card overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex justify-between items-center">
          <h2 className="text-headline-md font-bold text-accent">All Sessions</h2>
        </div>
        
        {consultations.length > 0 ? (
          <div className="divide-y divide-outline-variant/35">
            {consultations.map((c) => (
              <div key={c._id} className="px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-surface/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-surface-hover rounded-lg">
                    <span className="material-symbols-outlined text-accent">video_call</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-accent text-body-md">{c.category}</h4>
                    {c.consultantId ? (
                      <p className="text-xs text-text-muted">Advisor: {c.consultantId.name} ({c.consultantId.email})</p>
                    ) : (
                      <p className="text-xs text-text-muted">Pending assignment by department admin</p>
                    )}
                    {c.status === 'pending' ? (
                      <p className="text-xs text-secondary font-bold mt-1.5 flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded-full w-fit">
                        <span className="material-symbols-outlined text-[14px]">pending</span> {c.consultantId ? 'Expert meet details will be shared with you' : 'Awaiting consultant assignment'}
                      </p>
                    ) : (
                      <p className="text-xs text-success font-bold mt-1.5 flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full w-fit">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> Scheduled: {c.confirmedDate} at {c.confirmedTime}
                      </p>
                    )}
                    {c.clientNotes && (
                      <p className="text-xs text-text-muted mt-2 italic bg-surface p-2 rounded-lg border border-border">
                        Notes: "{c.clientNotes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                  <span className={`status-badge ${c.status === 'pending' ? 'status-warning' : 'status-success'}`}>
                    {c.status === 'pending' ? 'Pending Approval' : 'Confirmed'}
                  </span>
                  {c.status === 'accepted' && c.meetingLink && (
                    <a href={c.meetingLink} target="_blank" rel="noopener noreferrer">
                      <button className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">videocam</span> Join
                      </button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
              <span className="material-symbols-outlined text-3xl">event_busy</span>
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-accent">No Sessions Booked</h3>
              <p className="text-body-md text-text-muted mt-2">
                You do not have any upcoming or historical consultation sessions scheduled. Use the "Book Expert" button above to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
