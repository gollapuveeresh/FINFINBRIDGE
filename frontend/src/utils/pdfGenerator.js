import { getHealthMetrics } from './healthScoreCalculator';

// ── Invoice PDF ────────────────────────────────────────────────────────────────
// Renders a clean, printable invoice in a hidden iframe and opens the browser's
// print dialog (which lets the user "Save as PDF"). Same approach as the report below.
export const downloadInvoicePDF = (invoice, user) => {
  if (!invoice) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency || 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const clientName  = invoice.clientId?.name  || user?.name  || 'N/A';
  const clientEmail = invoice.clientId?.email || user?.email || '';
  const consultant  = invoice.consultantId?.name || 'FinBridge Advisory';
  const statusClass = invoice.status === 'paid' ? 'badge-paid' : invoice.status === 'overdue' ? 'badge-overdue' : 'badge-sent';

  const lineItemsHtml = (invoice.lineItems || []).map(li => `
    <tr>
      <td>${li.description || '—'}</td>
      <td style="text-align:right;">${formatCurrency(li.amount)}</td>
    </tr>
  `).join('');

  doc.write(`
    <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber || ''}</title>
        <style>
          body { font-family: serif; color: #111827; margin: 40px; font-size: 14px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E5E7EB; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 700; color: #D4AF37; }
          .logo span { display:block; font-size: 11px; color:#6B7280; font-weight:500; letter-spacing:0.05em; }
          .title { text-align: right; }
          .title h1 { margin: 0; font-size: 22px; color: #111827; letter-spacing: 0.02em; }
          .title p { margin: 4px 0 0 0; font-size: 12px; color: #6B7280; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 6px; }
          .badge-paid { background-color: #DEF7EC; color: #03543F; }
          .badge-sent { background-color: #FEF3C7; color: #92400E; }
          .badge-overdue { background-color: #FDE8E8; color: #9B1C1C; }
          .meta-grid { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 30px; }
          .meta-block { flex: 1; }
          .meta-block .label { font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
          .meta-block .value { font-weight: 600; color: #111827; }
          .meta-block .sub { color: #6B7280; font-weight: 400; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background-color: #F3F4F6; color: #374151; text-align: left; padding: 10px 12px; font-weight: 600; font-size: 12px; text-transform: uppercase; }
          th.amt, td.amt { text-align: right; }
          td { padding: 12px; border-bottom: 1px solid #E5E7EB; color: #4B5563; }
          .totals { width: 280px; margin-left: auto; }
          .totals .row { display: flex; justify-content: space-between; padding: 6px 0; }
          .totals .row.grand { border-top: 2px solid #E5E7EB; margin-top: 6px; padding-top: 12px; font-size: 18px; font-weight: 700; color: #111827; }
          .footer { text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 50px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">FinBridge<span>Premium Financial Solutions</span></div>
          <div class="title">
            <h1>INVOICE</h1>
            <p>${invoice.invoiceNumber || ''}</p>
            <span class="badge ${statusClass}">${invoice.status || 'sent'}</span>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-block">
            <div class="label">Billed To</div>
            <div class="value">${clientName}</div>
            <div class="sub">${clientEmail}</div>
          </div>
          <div class="meta-block">
            <div class="label">Service</div>
            <div class="value">${invoice.serviceTitle || '—'}</div>
            <div class="sub" style="text-transform:capitalize;">${invoice.department || ''} • ${consultant}</div>
          </div>
          <div class="meta-block" style="text-align:right;">
            <div class="label">Invoice Date</div>
            <div class="value">${formatDate(invoice.createdAt)}</div>
            <div class="sub">Due: ${formatDate(invoice.dueDate)}</div>
            ${invoice.paidAt ? `<div class="sub">Paid: ${formatDate(invoice.paidAt)}</div>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Description</th><th class="amt">Amount</th></tr>
          </thead>
          <tbody>
            ${lineItemsHtml || `<tr><td>${invoice.serviceTitle || 'Advisory Service'}</td><td class="amt">${formatCurrency(invoice.subtotal)}</td></tr>`}
          </tbody>
        </table>

        <div class="totals">
          <div class="row"><span>Subtotal</span><span>${formatCurrency(invoice.subtotal)}</span></div>
          <div class="row"><span>GST (${invoice.taxPercent ?? 18}%)</span><span>${formatCurrency(invoice.tax)}</span></div>
          <div class="row grand"><span>Total</span><span>${formatCurrency(invoice.totalAmount)}</span></div>
        </div>

        ${invoice.notes ? `<p style="margin-top:24px; color:#6B7280; font-size:13px;"><strong>Note:</strong> ${invoice.notes}</p>` : ''}

        <div class="footer">
          <p>Thank you for choosing FinBridge Solutions.</p>
          <p>This is a computer-generated invoice and is valid without a signature.</p>
        </div>
      </body>
    </html>
  `);

  doc.close();
  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => { document.body.removeChild(iframe); }, 1000);
  }, 500);
};

export const downloadPDFReport = (profile, summary, loans, user) => {
  // Compute health score dynamically
  const metrics = getHealthMetrics(profile, summary);

  // Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  
  // Format dates/currency nicely
  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Write content
  doc.write(`
    <html>
      <head>
        <title>Executive Wealth & Portfolio Statement</title>
        <style>
          body {
            font-family: serif;
            color: #111827;
            margin: 40px;
            font-size: 14px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #D4AF37; /* FinBridge Gold */
          }
          .title {
            text-align: right;
          }
          .title h1 {
            margin: 0;
            font-size: 20px;
            color: #111827;
          }
          .title p {
            margin: 5px 0 0 0;
            font-size: 12px;
            color: #6B7280;
          }
          .grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .section {
            background-color: #F9FAFB;
            border: 1px solid #F3F4F6;
            border-radius: 8px;
            padding: 20px;
          }
          .section-title {
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 8px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .meta-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .meta-item:last-child {
            margin-bottom: 0;
          }
          .meta-label {
            color: #6B7280;
            font-weight: 500;
          }
          .meta-value {
            font-weight: 600;
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 30px;
          }
          th {
            background-color: #F3F4F6;
            color: #374151;
            text-align: left;
            padding: 10px 12px;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            border-bottom: 2px solid #E5E7EB;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
            color: #4B5563;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .badge-active { background-color: #DEF7EC; color: #03543F; }
          .badge-pending { background-color: #FEF3C7; color: #92400E; }
          .badge-completed { background-color: #E1EFFE; color: #1E429F; }
          .badge-risk-low { background-color: #DEF7EC; color: #03543F; }
          .badge-risk-med { background-color: #FEF3C7; color: #92400E; }
          .badge-risk-hig { background-color: #FDE8E8; color: #9B1C1C; }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #9CA3AF;
            border-top: 1px solid #E5E7EB;
            padding-top: 20px;
            margin-top: 50px;
          }
          @media print {
            body {
              margin: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">FinBridge</div>
          <div class="title">
            <h1>Executive Financial Statement</h1>
            <p>Generated on ${formatDate(new Date())}</p>
          </div>
        </div>

        <div class="grid">
          <div class="section">
            <div class="section-title">Client Details</div>
            <div class="meta-item">
              <span class="meta-label">Client Name</span>
              <span class="meta-value">${user?.name || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Email</span>
              <span class="meta-value">${user?.email || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Net Worth Tier</span>
              <span class="meta-value">${profile?.netWorthTier || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Risk Profile</span>
              <span class="meta-value">
                <span class="badge badge-risk-${(profile?.riskTolerance || 'medium').toLowerCase().slice(0, 3)}">
                  ${profile?.riskTolerance || 'Medium'}
                </span>
              </span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Portfolio Summary</div>
            <div class="meta-item">
              <span class="meta-label">Total Assets</span>
              <span class="meta-value">${formatCurrency(summary?.totalAssets)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total Liabilities</span>
              <span class="meta-value">${formatCurrency(summary?.totalLiabilities)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Net Worth</span>
              <span class="meta-value">${formatCurrency(summary?.netWorth)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Financial Health Score</span>
              <span class="meta-value">${metrics?.score || 'N/A'} / 100</span>
            </div>
          </div>
        </div>

        <h3 style="margin-top: 40px; color: #111827; font-size: 16px; font-weight: 600; border-bottom: 2px solid #F3F4F6; padding-bottom: 8px;">Asset Allocation</h3>
        <table>
          <thead>
            <tr>
              <th>Asset Class</th>
              <th>Current Balance</th>
              <th>Target Allocation</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Liquid Assets & Cash Equivalents</td>
              <td>${formatCurrency(profile?.liquidAssets)}</td>
              <td>20.0%</td>
              <td>${summary?.totalAssets ? ((profile.liquidAssets / summary.totalAssets) * 100).toFixed(1) + '%' : 'N/A'}</td>
            </tr>
            <tr>
              <td>Long-Term Investments</td>
              <td>${formatCurrency(profile?.longTermInvestments)}</td>
              <td>50.0%</td>
              <td>${summary?.totalAssets ? ((profile.longTermInvestments / summary.totalAssets) * 100).toFixed(1) + '%' : 'N/A'}</td>
            </tr>
            <tr>
              <td>Real Estate Assets</td>
              <td>${formatCurrency(profile?.realEstateAssets)}</td>
              <td>20.0%</td>
              <td>${summary?.totalAssets ? ((profile.realEstateAssets / summary.totalAssets) * 100).toFixed(1) + '%' : 'N/A'}</td>
            </tr>
            <tr>
              <td>Other Business Assets</td>
              <td>${formatCurrency(profile?.otherAssets)}</td>
              <td>10.0%</td>
              <td>${summary?.totalAssets ? ((profile.otherAssets / summary.totalAssets) * 100).toFixed(1) + '%' : 'N/A'}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin-top: 40px; color: #111827; font-size: 16px; font-weight: 600; border-bottom: 2px solid #F3F4F6; padding-bottom: 8px;">Active Loan Facilities</h3>
        ${loans && loans.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Lender / Facility</th>
                <th>Type</th>
                <th>Principal Amount</th>
                <th>Outstanding Balance</th>
                <th>Interest Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${loans.map(loan => `
                <tr>
                  <td><strong>${loan.lenderName || 'N/A'}</strong></td>
                  <td>${loan.loanType || 'N/A'}</td>
                  <td>${formatCurrency(loan.principalAmount)}</td>
                  <td>${formatCurrency(loan.outstandingBalance)}</td>
                  <td>${loan.interestRate || 'N/A'}%</td>
                  <td><span class="badge badge-${(loan.status || 'pending').toLowerCase()}">${loan.status || 'Pending'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <p style="color: #6B7280; font-style: italic; margin-top: 15px;">No active loan facilities found on record.</p>
        `}

        <div class="footer">
          <p>Confidential Document &bull; FinBridge Wealth Advisory &bull; Internal Platform Copy</p>
          <p>ISO 27001 Certified &bull; Secure Encrypted Data Transmission</p>
        </div>
      </body>
    </html>
  `);

  doc.close();

  // Print once fully loaded
  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};
