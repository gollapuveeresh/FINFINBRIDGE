import { useEffect, useState } from 'react';
import B2BLayout from '../../layouts/B2BLayout';
import { useB2BAuth } from '../../context/B2BAuthContext';
import b2bApi from '../../services/b2bApi';

const STATUS_COLORS = {
  scheduled:'bg-blue-500/15 text-blue-400', completed:'bg-green-500/15 text-green-400',
  cancelled:'bg-red-500/15 text-red-400', rescheduled:'bg-amber-500/15 text-amber-400',
};
const TYPE_ICONS = { video:'videocam', in_person:'location_on', phone:'call' };

export default function B2BMeetings() {
  const { company } = useB2BAuth();
  const orgId = company?.organizationId;
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    if (!orgId) return;
    b2bApi.get(`/b2b/organizations/${orgId}/meetings`).then(r => setMeetings(r.data)).catch(() => {});
  }, [orgId]);

  const upcoming = meetings.filter(m => m.status === 'scheduled');
  const past     = meetings.filter(m => m.status !== 'scheduled');

  const MeetCard = ({ m }) => (
    <div className="card p-5 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-accent text-2xl">{TYPE_ICONS[m.meetingType] || 'event'}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-text">{m.title}</h3>
            <p className="text-xs text-text-muted mt-0.5 capitalize">
              {m.meetingType?.replace('_',' ')} · {m.durationMinutes} min
            </p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[m.status] || ''}`}>
            {m.status}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
          {m.scheduledAt && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              {new Date(m.scheduledAt).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })}
            </span>
          )}
          {m.meetingLink && m.status === 'scheduled' && (
            <a href={m.meetingLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-secondary hover:underline">
              <span className="material-symbols-outlined text-sm">link</span>Join Meeting
            </a>
          )}
        </div>
        {m.agenda && <p className="text-xs text-text-muted mt-2 border-t border-border pt-2">{m.agenda}</p>}
      </div>
    </div>
  );

  return (
    <B2BLayout>
      <div>
        <h1 className="text-xl font-bold text-accent">Meetings</h1>
        <p className="text-text-muted text-sm mt-0.5">Scheduled meetings with your FinBridge consultants</p>
      </div>

      {meetings.length === 0 ? (
        <div className="card p-16 text-center text-text-muted">
          <span className="material-symbols-outlined text-4xl block mb-3 opacity-30">calendar_month</span>
          <p className="font-semibold">No meetings scheduled</p>
          <p className="text-xs mt-1">Your consultant will schedule meetings as your service request progresses.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-3">Upcoming ({upcoming.length})</h2>
              <div className="space-y-3">{upcoming.map(m => <MeetCard key={m.id} m={m} />)}</div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-3 mt-4">Past Meetings ({past.length})</h2>
              <div className="space-y-3">{past.map(m => <MeetCard key={m.id} m={m} />)}</div>
            </div>
          )}
        </>
      )}
    </B2BLayout>
  );
}
