import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import B2BLayout from '../../layouts/B2BLayout';
import { useB2BAuth } from '../../context/B2BAuthContext';
import b2bApi from '../../services/b2bApi';

const DOC_TYPES = [
  { key: 'GST_CERTIFICATE', label: 'VAT Registration (BIN)', icon: 'receipt_long', required: true },
  { key: 'PAN', label: 'TIN Certificate', icon: 'badge', required: true },
  { key: 'CIN', label: 'CIN Document', icon: 'apartment', required: true },
  { key: 'INCORPORATION', label: 'Incorporation Certificate', icon: 'gavel', required: true },
  { key: 'BANK_STATEMENT', label: 'Bank Statement (6 months)', icon: 'account_balance', required: true },
  { key: 'FINANCIAL_STATEMENT', label: 'Financial Statements', icon: 'bar_chart', required: false },
  { key: 'OTHER', label: 'Other Documents', icon: 'attach_file', required: false },
];

const STATUS_COLORS = {
  pending: 'bg-amber-500/15 text-amber-400',
  verified: 'bg-green-500/15 text-green-400',
  rejected: 'bg-red-500/15 text-red-400',
};

export default function B2BDocuments() {
  const { company } = useB2BAuth();
  const orgId = company?.organizationId;
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(null);   // documentType currently uploading

  const fetchDocs = useCallback(() => {
    if (!orgId) {
      console.warn("fetchDocs: orgId is missing!");
      return;
    }
    b2bApi.get(`/b2b/organizations/${orgId}/documents`)
      .then(r => {
        console.log("fetchDocs: successfully fetched documents:", r.data);
        setDocs(r.data);
      })
      .catch(e => {
        console.error("fetchDocs: failed to fetch documents:", e);
        toast.error("Failed to load documents list.");
      });
  }, [orgId]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

  const handleUpload = (documentType, file) => {
    if (!file) return;
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only PDF, JPG, or PNG files are allowed.'); return;
    }
    if (file.size > 6 * 1024 * 1024) { toast.error('File too large. Maximum size is 6 MB.'); return; }
    setUploading(documentType);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await b2bApi.post(`/b2b/organizations/${orgId}/documents`, {
          documentType, fileName: file.name, content: reader.result,   // base64 data URI
        });
        toast.success(`${file.name} uploaded`);
        fetchDocs();
      } catch {
        toast.error('Upload failed. Please try again.');
      } finally { setUploading(null); }
    };
    reader.onerror = () => { toast.error('Could not read the file.'); setUploading(null); };
    reader.readAsDataURL(file);
  };

  const getDocStatus = (key) => {
    const d = docs.find(d => d.documentType === key);
    return d ? d.status : null;
  };

  const verifiedCount = DOC_TYPES.filter(t => getDocStatus(t.key) === 'verified').length;
  const requiredCount = DOC_TYPES.filter(t => t.required).length;

  return (
    <B2BLayout>
      <div>
        <h1 className="text-xl font-bold text-accent">Documents & KYC</h1>
        <p className="text-text-muted text-sm mt-0.5">Upload and manage your company's verification documents</p>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-text">KYC Verification Progress</p>
            <p className="text-xs text-text-muted mt-0.5">{verifiedCount} of {requiredCount} required documents verified</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full
            ${company?.kycVerified ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
            {company?.kycVerified ? '✓ KYC Verified' : '⏳ Pending'}
          </span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${(verifiedCount / requiredCount) * 100}%` }} />
        </div>
      </div>

      {/* Document list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOC_TYPES.map(dt => {
          const status = getDocStatus(dt.key);
          const uploaded = docs.find(d => d.documentType === dt.key);
          return (
            <div key={dt.key} className="card p-5 flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                ${status === 'verified' ? 'bg-green-500/20' : status === 'rejected' ? 'bg-red-500/20' : status === 'pending' ? 'bg-amber-500/20' : 'bg-surface-hover'}`}>
                <span className={`material-symbols-outlined text-xl
                  ${status === 'verified' ? 'text-green-400' : status === 'rejected' ? 'text-red-400' : status === 'pending' ? 'text-amber-400' : 'text-text-muted'}`}>
                  {dt.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-text">{dt.label}</p>
                  {dt.required && <span className="text-[10px] text-red-400 font-bold">Required</span>}
                </div>
                {uploaded ? (
                  <div className="mt-1.5 space-y-1">
                    <p className="text-xs text-text-muted truncate">{uploaded.fileName || 'Uploaded'}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || ''}`}>
                      {status}
                    </span>
                    {uploaded.reviewerNote && status === 'rejected' && (
                      <p className="text-xs text-red-400 mt-1">{uploaded.reviewerNote}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted mt-1">Not uploaded</p>
                )}
                <label className={`inline-flex items-center gap-1.5 mt-3 text-xs font-semibold cursor-pointer
                  px-3 py-1.5 rounded-lg border transition-colors
                  ${status === 'verified' ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                    : 'border-border text-text-muted hover:border-accent/50 hover:text-accent'}`}>
                  <span className="material-symbols-outlined text-base">upload</span>
                  {uploading === dt.key ? 'Uploading…' : status ? 'Re-upload' : 'Upload'}
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    disabled={uploading === dt.key}
                    onChange={e => handleUpload(dt.key, e.target.files[0])} />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-5 bg-secondary/5 border-secondary/20">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary text-xl mt-0.5">info</span>
          <div className="text-sm text-text-muted">
            <p className="font-semibold text-secondary mb-1">Document Guidelines</p>
            <ul className="space-y-1 text-xs">
              <li>• All documents must be clear, legible PDFs or images (JPG/PNG)</li>
              <li>• Bank statements should cover the last 6 months</li>
              <li>• Maximum file size: 6 MB per document</li>
              <li>• Our compliance team reviews within 24–48 business hours</li>
            </ul>
          </div>
        </div>
      </div>
    </B2BLayout>
  );
}
