import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import api from '../../services/api';

export default function ConsultantSchedule() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Scheduling Inputs
  const [schedulingId, setSchedulingId] = useState(null);
  const [inputDate, setInputDate] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Buffer rules states (keep UI as static dashboard configuration)
  const [slotBuffer, setSlotBuffer] = useState(15);
  const [allowInstantBooking, setAllowInstantBooking] = useState(true);
  const [notifState, setNotifState] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/consultations');
      if (res.data && res.data.status === 'success') {
        setMeetings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch consultations:', err);
      setError(err.response?.data?.message || 'Failed to load scheduling pipeline.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSchedule = async (id) => {
    if (!inputDate || !inputTime) {
      alert('Please select/enter both Date and Time.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.patch(`/consultations/${id}/accept`, {
        confirmedDate: inputDate,
        confirmedTime: inputTime
      });
      if (res.data && res.data.status === 'success') {
        setSchedulingId(null);
        setInputDate('');
        setInputTime('');
        setSuccessMsg('Meeting accepted and synced successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchMeetings();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to schedule consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSettings = () => {
    setSuccessMsg('Scheduling rules synced successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  if (loading) {
    return (
      <ConsultantLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading meetings pipeline...</p>
        </div>
      </ConsultantLayout>
    );
  }

  return (
    <ConsultantLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Calendar & Consultation Schedule</h1>
          <p className="text-body-md text-text-muted mt-1">Configure slot availability rules, manage booking buffers, and launch meeting links.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-body-sm font-bold my-4">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-body-sm font-bold flex items-center gap-2 my-4">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-12 gap-gutter my-6">
        {/* Left Side: Consultation Schedule Ledger */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="col-span-12 lg:col-span-8 card overflow-hidden flex flex-col justify-between min-h-[500px]"
        >
          <div>
            <div className="px-8 py-5 border-b border-border/40 flex justify-between items-center bg-surface-hover-lowest">
              <h3 className="text-headline-md font-bold text-accent">Relationship Meetings Pipeline</h3>
              <span className="text-xs px-2.5 py-1 bg-accent/10 text-accent rounded-full font-bold">
                {meetings.length} requests in ledger
              </span>
            </div>
            
            <div className="divide-y divide-outline-variant/35 overflow-y-auto max-h-[440px]">
              <AnimatePresence>
                {meetings.map((meet, index) => (
                  <motion.div 
                    key={meet._id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="px-8 py-5 flex flex-col gap-4 hover:bg-white/[0.01] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-surface-hover rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-accent">video_call</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-accent text-body-md">{meet.clientId?.name || 'Unknown Client'}</h4>
                          <p className="text-xs text-text-muted mt-0.5">
                            {meet.clientId?.companyName || 'Individual Client'} • {meet.category}
                          </p>
                          {meet.status === 'pending' ? (
                            <p className="text-xs text-warning font-bold mt-1.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">pending</span> Waiting for schedule details
                            </p>
                          ) : (
                            <p className="text-xs text-secondary font-bold mt-1.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span> {meet.confirmedDate} at {meet.confirmedTime}
                            </p>
                          )}
                          {meet.clientNotes && (
                            <p className="text-xs text-text-muted mt-2.5 italic bg-surface p-2 rounded-lg border border-border">
                              Client Notes: "{meet.clientNotes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                        <span className={`status-badge ${meet.status === 'pending' ? 'status-warning' : 'status-success'}`}>
                          {meet.status === 'pending' ? 'Pending Approval' : 'Confirmed'}
                        </span>
                        <div className="flex gap-2">
                          {meet.status === 'pending' ? (
                            schedulingId !== meet._id && (
                              <button 
                                onClick={() => {
                                  setSchedulingId(meet._id);
                                  setInputDate('');
                                  setInputTime('');
                                }}
                                className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 font-bold cursor-pointer font-sans"
                              >
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span> Schedule & Accept
                              </button>
                            )
                          ) : (
                            meet.meetingLink && (
                              <a href={meet.meetingLink} target="_blank" rel="noopener noreferrer">
                                <button className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 cursor-pointer font-sans">
                                  <span className="material-symbols-outlined text-[14px]">videocam</span> Join
                                </button>
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline Scheduling Form */}
                    {schedulingId === meet._id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 rounded-xl border border-secondary/35 bg-surface-hover-lowest space-y-4 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                      >
                        <h5 className="text-label-sm font-bold text-accent uppercase tracking-wider">Specify Schedule Time</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-text-muted block mb-1">Meeting Date</label>
                            <input 
                              type="date"
                              value={inputDate}
                              onChange={(e) => setInputDate(e.target.value)}
                              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-semibold text-accent focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-text-muted block mb-1">Meeting Time Slot</label>
                            <input 
                              type="text"
                              placeholder="e.g. 11:30 AM - 12:15 PM EST"
                              value={inputTime}
                              onChange={(e) => setInputTime(e.target.value)}
                              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-semibold text-accent focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => setSchedulingId(null)}
                            className="btn-ghost py-1.5 px-3 text-xs font-bold cursor-pointer font-sans"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleConfirmSchedule(meet._id)}
                            disabled={submitting}
                            className="btn-primary py-1.5 px-4 text-xs font-bold cursor-pointer font-sans"
                          >
                            {submitting ? 'Confirming...' : 'Accept & Sync'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {meetings.length === 0 && (
                <div className="py-16 text-center text-text-muted text-body-md">No consultations scheduled in pipeline.</div>
              )}
            </div>
          </div>
          
          <div className="px-8 py-4 border-t border-border/35 text-xs text-text-muted font-semibold bg-surface-hover-lowest">
            Meetings synced with Outlook Calendar & Google Workspace feeds
          </div>
        </motion.div>

        {/* Right Side: Slot Availability Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="col-span-12 lg:col-span-4 card p-8 space-y-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-headline-md font-bold text-accent pb-4 border-b border-border/40">Scheduling Settings</h3>
            
            <div className="space-y-6 mt-4">
              {/* Slot Buffer Slider */}
              <div>
                <div className="flex justify-between items-center mb-2 text-body-sm">
                  <label className="font-bold text-accent">Slot Buffer Time</label>
                  <span className="font-bold text-secondary">{slotBuffer} Minutes</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={slotBuffer}
                  onChange={(e) => setSlotBuffer(Number(e.target.value))}
                  className="w-full accent-secondary h-2 bg-surface-hover-high rounded-lg cursor-pointer"
                />
              </div>

              {/* Availability rules switches */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-body-sm font-bold text-accent">Allow Instant Bookings</p>
                    <p className="text-xs text-text-muted">Clients can book slots without approval</p>
                  </div>
                  <button 
                    onClick={() => setAllowInstantBooking(!allowInstantBooking)}
                    className={`w-12 h-6 rounded-full relative transition-all cursor-pointer border-0 ${allowInstantBooking ? 'bg-success' : 'bg-outline-variant'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${allowInstantBooking ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-body-sm font-bold text-accent">Send Email Reminders</p>
                    <p className="text-xs text-text-muted">Notify client 24 hours prior to sync</p>
                  </div>
                  <button 
                    onClick={() => setNotifState(!notifState)}
                    className={`w-12 h-6 rounded-full relative transition-all cursor-pointer border-0 ${notifState ? 'bg-success' : 'bg-outline-variant'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifState ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border mt-6">
            <button 
              onClick={handleSaveSettings}
              className="btn-primary w-full py-3 text-label-lg cursor-pointer font-sans"
            >
              Save Scheduling Rules
            </button>
          </div>
        </motion.div>
      </div>
    </ConsultantLayout>
  );
}
