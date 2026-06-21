import ConsultantLayout from '../../layouts/ConsultantLayout';
import { useState, useEffect } from 'react';
import { clientPortfolio } from './ClientList';
import api from '../../services/api';

// Change 7: Target client dropdown matches clientPortfolio (Change 5 compliance)
const clientOptions = clientPortfolio.map(c => c.contact);

const initialVaultDocs = [
  { id: 'doc-1', client: 'Alexander Vance', type: 'W-2 Statement', date: 'Oct 01, 2024', uploadedBy: 'Client', size: '1.2 MB', filename: 'W2_Statement_AlexanderVance_2024.pdf' },
  { id: 'doc-2', client: 'Sarah Mitchell', type: 'Form 1099-INT', date: 'Oct 02, 2024', uploadedBy: 'Client', size: '0.8 MB', filename: 'Form1099_INT_SarahMitchell_2024.pdf' },
  { id: 'doc-3', client: 'James Harrington', type: 'H1 Portfolio Valuation', date: 'Jun 15, 2024', uploadedBy: 'Advisor (You)', size: '3.4 MB', filename: 'H1_PortfolioValuation_JamesHarrington_2024.pdf' },
  { id: 'doc-4', client: 'Alexander Vance', type: 'Quarterly Advisory Report Q3', date: 'Oct 15, 2024', uploadedBy: 'Advisor (You)', size: '2.8 MB', filename: 'Q3_AdvisoryReport_AlexanderVance_2024.pdf' },
];

// Helper: generate a minimal downloadable PDF blob from text
function downloadMockPDF(filename, docType, clientName) {
  // Create a simple plain-text blob to simulate a downloadable file
  const content = `FinBridge Solutions — ${docType}\nClient: ${clientName}\nGenerated: ${new Date().toLocaleString()}\n\nThis document is a placeholder for the actual ${docType} file stored in the secure vault.`;
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ConsultantReports() {
  const [vaultDocs, setVaultDocs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Builder Form States
  const [targetClient, setTargetClient] = useState('');
  const [reportTitle, setReportTitle] = useState('Quarterly Performance Statement');
  const [highlights, setHighlights] = useState('');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // 1. Fetch clients
    api.get('/auth/consultant/clients')
      .then(r => {
        const list = (r.data.clients || []).map(c => c.name);
        const allClientNames = Array.from(new Set([
          ...list,
          ...clientPortfolio.map(c => c.contact || c.name)
        ]));
        setClients(allClientNames);
        if (allClientNames.length > 0) {
          setTargetClient(allClientNames[0]);
        }
      })
      .catch(() => {
        const mockNames = clientPortfolio.map(c => c.contact || c.name);
        setClients(mockNames);
        if (mockNames.length > 0) {
          setTargetClient(mockNames[0]);
        }
      });

    // 2. Fetch documents
    setLoading(true);
    api.get('/documents/consultant')
      .then(r => {
        const docs = (r.data.documents || []).map(d => ({
          id: d.id || d._id,
          client: d.clientId ? d.clientId.name : 'Organization',
          type: d.type || 'Document',
          date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
          uploadedBy: d.status === 'Signed' ? 'Advisor (You)' : 'Client',
          size: d.size || '1.5 MB',
          filename: d.name || `${d.type}.pdf`,
        }));
        setVaultDocs(docs);
      })
      .catch(() => {
        setVaultDocs(initialVaultDocs);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (!reportTitle) return;

    setGenerating(true);
    setTimeout(() => {
      const filename = `${reportTitle.replace(/\s+/g, '_')}_${targetClient.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      setVaultDocs(prev => [
        {
          id: `doc-${Date.now()}`,
          client: targetClient,
          type: reportTitle,
          date: 'Just now',
          uploadedBy: 'Advisor (You)',
          size: '1.8 MB',
          filename,
        },
        ...prev
      ]);
      setGenerating(false);
      setReportTitle('Quarterly Performance Statement');
      setHighlights('');
      setSuccess('Institutional report compiled and published successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1500);
  };

  const handleDeleteDoc = (id) => {
    setVaultDocs(prev => prev.filter(d => d.id !== id));
  };

  return (
    <ConsultantLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Client Documents</h1>
          <p className="text-body-md text-text-muted mt-1">Compile PDF client reports, review tax worksheets, and manage document vaults.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Side: Report Compiler */}
        <div className="col-span-12 lg:col-span-5 card p-8 flex flex-col justify-between h-fit">
          <form onSubmit={handleGenerateReport} className="space-y-6">
            <h3 className="text-headline-md font-bold text-accent pb-4 border-b border-border/40">Quarterly Report Builder</h3>

            {success && (
              <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-body-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                {success}
              </div>
            )}

            {/* Change 7: Target Client dropdown matches clientPortfolio */}
            <div className="space-y-2">
              <label className="text-label-lg text-accent font-bold">Target Client</label>
              <select
                value={targetClient}
                onChange={(e) => setTargetClient(e.target.value)}
                className="form-input"
              >
                {clients.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-label-lg text-accent font-bold">Statement Document Title</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="form-input font-medium text-accent"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-label-lg text-accent font-bold">Executive Highlights Summary</label>
              <textarea
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Brief summary points of portfolio returns and mortgage refinancing options..."
                className="form-input min-h-[100px] resize-none leading-relaxed text-body-md text-accent font-medium"
              />
            </div>

            <div className="pt-4 border-t border-border/35">
              <button
                type="submit"
                disabled={generating}
                className={`w-full py-4 bg-accent text-on-primary font-bold rounded-lg hover:opacity-90 transition-all flex justify-center items-center gap-2 ${generating ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Compiling Data...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                    Compile & Publish Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Document Vault */}
        <div className="col-span-12 lg:col-span-7 card overflow-hidden flex flex-col justify-between h-[580px]">
          <div>
            <div className="px-8 py-5 border-b border-border/40 flex justify-between items-center bg-surface-hover-lowest shrink-0">
              <h3 className="text-headline-md font-bold text-accent">Relationship Vault Files</h3>
              <span className="text-xs text-text-muted font-bold">{vaultDocs.length} document{vaultDocs.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="divide-y divide-outline-variant/35 overflow-y-auto max-h-[440px]">
              {loading ? (
                <div className="py-16 text-center text-text-muted text-body-md">
                  <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  Loading documents...
                </div>
              ) : vaultDocs.length === 0 ? (
                <div className="py-16 text-center text-text-muted text-body-md">No documents are submitted.</div>
              ) : (
                vaultDocs.map((doc) => (
                  <div key={doc.id} className="px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-surface/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-surface-hover rounded-lg">
                        <span className="material-symbols-outlined text-accent">
                          {doc.type.includes('Report') || doc.type.includes('Statement') ? 'picture_as_pdf' : 'description'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-accent text-body-md">{doc.type}</h4>
                        <p className="text-xs text-text-muted">Client: <strong>{doc.client}</strong> • Uploaded by {doc.uploadedBy} • {doc.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-auto">
                      <span className="text-xs font-bold text-text-muted">{doc.size}</span>
                      <div className="flex gap-2">
                        {/* Change 7: Download button is now functional */}
                        <button
                          onClick={() => downloadMockPDF(doc.filename, doc.type, doc.client)}
                          title="Download"
                          className="text-secondary hover:text-accent transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                        </button>
                        <button onClick={() => handleDeleteDoc(doc.id)} className="text-error hover:underline transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="px-8 py-4 border-t border-border/35 text-xs text-text-muted font-semibold bg-surface-hover-lowest shrink-0">
            Vault security: AES-256 Bit storage encryption active
          </div>
        </div>
      </div>
    </ConsultantLayout>
  );
}
