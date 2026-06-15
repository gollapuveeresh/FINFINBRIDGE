import ClientLayout from '../../layouts/ClientLayout';
import { useState } from 'react';

const faqs = [
  { q: 'How do I apply for a new business loan?', a: 'Navigate to Loans > Loan Management and click "Apply for New Loan." You\'ll need to complete our 3-step application form with your financial details. Our team will review within 2-3 business days.' },
  { q: 'How often is my portfolio performance updated?', a: 'Your portfolio data is updated in real-time during market hours (9:30 AM – 4:00 PM EST). After-hours updates occur automatically within 30 minutes of market close.' },
  { q: 'Can I download my tax documents?', a: 'Yes! Navigate to Tax Planning > Documents to download all your tax-related files including Form 1099, tax optimization reports, and quarterly summaries.' },
  { q: 'How do I schedule a consultation with an advisor?', a: 'Go to Consultations and click "Book New Session." Choose your preferred advisor, select a time slot, and specify the topic. You\'ll receive a confirmation email within 5 minutes.' },
  { q: 'What security measures protect my account?', a: 'We use bank-grade 256-bit AES encryption, two-factor authentication, and continuous fraud monitoring. Our systems are ISO 27001 certified and SOC 2 compliant.' },
  { q: 'How do I update my payment method for subscription?', a: 'Go to Billing & Subscription and click "Add Payment Method" in the Payment Method section. We accept all major credit cards and ACH bank transfers.' },
];

export default function HelpSupport() {
  const [openFaq, setOpenFaq] = useState(null);
  const [ticket, setTicket] = useState({ subject: '', category: 'Account & Billing', priority: 'Medium', message: '' });

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    const mailtoLink = `mailto:manumanohar1027@gmail.com?subject=${encodeURIComponent(
      `[Support Ticket - ${ticket.priority} Priority] ${ticket.subject}`
    )}&body=${encodeURIComponent(
      `Category: ${ticket.category}\nPriority: ${ticket.priority}\n\nMessage:\n${ticket.message}`
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <ClientLayout>
      <div>
        <h1 className="text-headline-lg font-bold text-accent">Help & Support</h1>
        <p className="text-body-md text-text-muted mt-1">Get answers and connect with our expert support team.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {[
          { icon: 'chat_bubble', title: 'Live Chat', desc: 'Connect with a support agent instantly during business hours.', action: 'Start Chat', color: 'bg-success/10 text-success' },
          { icon: 'mail', title: 'Email Support', desc: 'Send us a detailed message and we\'ll respond within 24 hours.', action: 'Send Email', color: 'bg-secondary/10 text-secondary' },
          { icon: 'call', title: 'Phone Support', desc: 'Speak directly with our financial advisory team.', action: '+1 (888) FIN-BRDG', color: 'bg-accent/10 text-accent' },
        ].map((item, i) => (
          <div key={i} className="card p-6 flex flex-col gap-4 hover:shadow-modal transition-all cursor-pointer">
            <div className={`p-3 rounded-xl w-fit ${item.color.split(' ')[0]}`}>
              <span className={`material-symbols-outlined ${item.color.split(' ')[1]}`}>{item.icon}</span>
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-accent">{item.title}</h3>
              <p className="text-body-sm text-text-muted mt-1">{item.desc}</p>
            </div>
            <button className="btn-ghost text-label-sm py-2 px-4 w-fit mt-auto">{item.action}</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* FAQ */}
        <div className="col-span-12 lg:col-span-7 card overflow-hidden">
          <div className="px-8 py-5 border-b border-border">
            <h2 className="text-headline-md font-bold text-accent">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-outline-variant/50">
            {faqs.map((faq, i) => (
              <div key={i} className="px-8">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-5 flex items-center justify-between text-left gap-4"
                >
                  <span className="font-semibold text-text">{faq.q}</span>
                  <span className={`material-symbols-outlined text-text-muted transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {openFaq === i && (
                  <div className="pb-5 fade-in">
                    <p className="text-body-md text-text-muted leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Ticket */}
        <div className="col-span-12 lg:col-span-5 space-y-gutter">
          <div className="card p-8">
            <h2 className="text-headline-md font-bold text-accent mb-6">Submit a Support Ticket</h2>
            <form className="space-y-5" onSubmit={handleSubmitTicket}>
              <div className="space-y-2">
                <label className="text-label-lg text-text">Subject</label>
                <input 
                  className="form-input" 
                  placeholder="Briefly describe your issue" 
                  type="text" 
                  value={ticket.subject}
                  onChange={(e) => setTicket({...ticket, subject: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-lg text-text">Category</label>
                <select 
                  className="form-input"
                  value={ticket.category}
                  onChange={(e) => setTicket({...ticket, category: e.target.value})}
                >
                  <option>Account & Billing</option>
                  <option>Technical Issue</option>
                  <option>Loan Inquiry</option>
                  <option>Investment Advisory</option>
                  <option>Security Concern</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-label-lg text-text">Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTicket({...ticket, priority: p})}
                      className={`flex-1 py-2 rounded-lg text-label-sm font-bold border transition-all ${ticket.priority === p ? 'border-secondary bg-accent/20 text-accent' : 'border-border text-text-muted hover:bg-surface'}`}
                    >{p}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-label-lg text-text">Message</label>
                <textarea 
                  className="form-input min-h-[120px] resize-none" 
                  placeholder="Describe your issue in detail..." 
                  value={ticket.message}
                  onChange={(e) => setTicket({...ticket, message: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-lg text-text">Attachments</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-secondary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-text-faint-variant text-3xl">upload_file</span>
                  <p className="text-body-sm text-text-muted mt-2">Drag & drop files or <span className="text-secondary font-bold">browse</span></p>
                  <p className="text-xs text-text-muted mt-1">PDF, PNG, JPG up to 10 MB</p>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer font-sans">
                <span className="material-symbols-outlined">send</span>Submit Ticket
              </button>
            </form>
          </div>

          {/* Status */}
          <div className="card p-6">
            <h3 className="text-headline-md font-bold text-accent mb-4">System Status</h3>
            <div className="space-y-3">
              {[
                { service: 'API Services', status: 'Operational' },
                { service: 'Dashboard', status: 'Operational' },
                { service: 'Payment Gateway', status: 'Operational' },
                { service: 'Data Sync', status: 'Degraded Performance' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-body-sm text-text">{s.service}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.status === 'Operational' ? 'bg-success' : 'bg-warning'}`}></div>
                    <span className={`text-xs font-bold ${s.status === 'Operational' ? 'text-success' : 'text-warning'}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
