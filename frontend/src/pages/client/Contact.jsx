import ClientLayout from '../../layouts/ClientLayout';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CONTACT_REASONS = [
  { label: 'General Inquiry', dept: null },
  { label: 'Loan Assistance', dept: 'loans' },
  { label: 'Investment Advisory', dept: 'investment' },
  { label: 'Tax Planning', dept: 'tax' },
  { label: 'Insurance Query', dept: 'insurance' },
  { label: 'Wealth Management', dept: 'wealth' },
  { label: 'Proposal Feedback', dept: null },
  { label: 'Account Issue', dept: null },
  { label: 'Complaint', dept: null },
  { label: 'Other', dept: null },
];

const OFFICES = [
  { city: 'Mumbai', address: 'Bandra Kurla Complex, BKC, Mumbai - 400051', phone: '+91 22 4000 1111', email: 'mumbai@finbridge.com', hours: 'Mon–Fri: 9AM–6PM IST' },
  { city: 'Delhi', address: 'Connaught Place, New Delhi - 110001', phone: '+91 11 4000 2222', email: 'delhi@finbridge.com', hours: 'Mon–Fri: 9AM–6PM IST' },
  { city: 'Bangalore', address: 'UB City, Vittal Mallya Road, Bengaluru - 560001', phone: '+91 80 4000 3333', email: 'bangalore@finbridge.com', hours: 'Mon–Fri: 9AM–6PM IST' },
];

export default function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    reason: 'General Inquiry',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeOffice, setActiveOffice] = useState(0);

  const selectedReason = CONTACT_REASONS.find(r => r.label === form.reason);
  const inferredDept = selectedReason?.dept || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) { toast.error('Please enter a message'); return; }
    try {
      setLoading(true);
      // Send as a lead capture with source = referral (internal contact)
      await api.post('/leads/capture', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        requirement: `[${form.reason}] ${form.message}`,
        source: 'referral',
        serviceType: form.reason,
        department: inferredDept,
      });
      setSubmitted(true);
      toast.success('Message sent! Our team will reach out within 24 hours.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      {/* Header */}
      <div>
        <h1 className="text-headline-lg font-bold text-accent">Contact Us</h1>
        <p className="text-body-md text-text-muted mt-1">Reach out to your advisor team or our support desk directly.</p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {[
          {
            icon: 'support_agent',
            title: 'Your Advisor',
            desc: 'Direct line to your assigned financial consultant.',
            action: 'Book a Call',
            link: '/client/consultations',
            color: 'text-accent bg-accent/10',
          },
          {
            icon: 'headset_mic',
            title: 'Support Desk',
            desc: '24/7 technical and account support via email or chat.',
            action: 'support@finbridge.com',
            href: 'mailto:support@finbridge.com',
            color: 'text-success bg-success/10',
          },
          {
            icon: 'call',
            title: 'Helpline',
            desc: 'Speak to a financial advisor Mon–Sat 9AM–7PM IST.',
            action: '+91 1800 000 FINB',
            href: 'tel:+911800000',
            color: 'text-secondary bg-secondary/10',
          },
        ].map((item, i) => (
          <div key={i} className="card p-6 flex flex-col gap-4">
            <div className={`p-3 rounded-xl w-fit ${item.color.split(' ')[1]}`}>
              <span className={`material-symbols-outlined ${item.color.split(' ')[0]}`}>{item.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-accent">{item.title}</h3>
              <p className="text-body-sm text-text-muted mt-1">{item.desc}</p>
            </div>
            {item.href ? (
              <a href={item.href} className="btn-ghost text-label-sm py-2 px-4 w-fit text-center rounded-xl border border-border hover:border-secondary transition-colors">
                {item.action}
              </a>
            ) : (
              <a href={item.link} className="btn-ghost text-label-sm py-2 px-4 w-fit text-center rounded-xl border border-border hover:border-secondary transition-colors">
                {item.action}
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Contact Form */}
        <div className="col-span-12 lg:col-span-7 card p-8">
          <h2 className="text-headline-md font-bold text-accent mb-6">Send Us a Message</h2>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-green-400 text-4xl">check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-accent mb-2">Message Received!</h3>
              <p className="text-text-muted max-w-sm">Our team will review your message and respond within 24 business hours.</p>
              <button
                onClick={() => { setSubmitted(false); setForm(f => ({ ...f, message: '', reason: 'General Inquiry' })); }}
                className="btn-primary mt-6 px-8 py-3"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-label-sm text-text-muted block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="form-input w-full"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-label-sm text-text-muted block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="form-input w-full"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-label-sm text-text-muted block mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="form-input w-full"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-text-muted block mb-1.5">Reason for Contact</label>
                  <select
                    value={form.reason}
                    onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                    className="form-input w-full"
                  >
                    {CONTACT_REASONS.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-label-sm text-text-muted block mb-1.5">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="form-input w-full min-h-[140px] resize-none"
                  placeholder="Describe your query or requirement in detail..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><span className="material-symbols-outlined">send</span> Send Message</>
                )}
              </button>

              <p className="text-xs text-text-muted text-center">
                Your message is logged and will be reviewed by our CRM team.
              </p>
            </form>
          )}
        </div>

        {/* Right Panel */}
        <div className="col-span-12 lg:col-span-5 space-y-gutter">
          {/* Office Selector */}
          <div className="card p-6">
            <h3 className="font-bold text-accent mb-4">Our Offices</h3>
            <div className="flex gap-2 mb-5">
              {OFFICES.map((o, i) => (
                <button
                  key={i}
                  onClick={() => setActiveOffice(i)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    activeOffice === i
                      ? 'bg-accent text-on-primary border-accent'
                      : 'border-border text-text-muted hover:border-secondary hover:text-secondary'
                  }`}
                >
                  {o.city}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {[
                { icon: 'location_on', value: OFFICES[activeOffice].address },
                { icon: 'call', value: OFFICES[activeOffice].phone, href: `tel:${OFFICES[activeOffice].phone}` },
                { icon: 'mail', value: OFFICES[activeOffice].email, href: `mailto:${OFFICES[activeOffice].email}` },
                { icon: 'schedule', value: OFFICES[activeOffice].hours },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border/50">
                  <span className="material-symbols-outlined text-secondary text-lg mt-0.5">{item.icon}</span>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-accent hover:underline">{item.value}</a>
                  ) : (
                    <p className="text-sm text-text">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Response Time */}
          <div className="card p-6">
            <h3 className="font-bold text-accent mb-4">Response Times</h3>
            <div className="space-y-3">
              {[
                { channel: 'In-App Message', time: 'Within 2 hours', dot: 'bg-green-500' },
                { channel: 'Email Support', time: 'Within 24 hours', dot: 'bg-yellow-500' },
                { channel: 'Phone Helpline', time: 'Immediate (Business Hours)', dot: 'bg-green-500' },
                { channel: 'Support Ticket', time: '1–2 Business Days', dot: 'bg-yellow-500' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${r.dot}`} />
                    <span className="text-sm text-text">{r.channel}</span>
                  </div>
                  <span className="text-xs font-semibold text-text-muted">{r.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social / Emergency */}
          <div className="card p-6">
            <h3 className="font-bold text-accent mb-4">Emergency Contact</h3>
            <p className="text-sm text-text-muted mb-4">For urgent financial matters or account security issues:</p>
            <a
              href="tel:+911800000"
              className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
            >
              <span className="material-symbols-outlined text-red-400 text-2xl">emergency</span>
              <div>
                <p className="font-bold text-red-400">+91 1800 000 FINB</p>
                <p className="text-xs text-text-muted">24/7 Emergency Helpline</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
