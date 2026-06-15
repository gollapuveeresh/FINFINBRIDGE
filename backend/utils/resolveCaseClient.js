import Lead from '../models/Lead.js';
import Client from '../models/Client.js';

// Resolve a clientId for a new case. If clientId is given, use it directly.
// Otherwise, if leadId is given, convert that lead to a client (or reuse an
// existing one) so leads from the pipeline can be used to open cases.
export async function resolveCaseClient({ clientId, leadId }) {
  if (clientId) return clientId;
  if (!leadId) return null;

  const lead = await Lead.findById(leadId);
  if (!lead) return null;

  if (lead.convertedClientId) return lead.convertedClientId;

  let client = await Client.findOne({ email: lead.email });
  if (!client) {
    const tempPassword = Math.random().toString(36).slice(-8) + 'Fb1!';
    client = await Client.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      password: tempPassword,
      isEmailVerified: true,
    });
  }

  await Lead.findByIdAndUpdate(lead._id, { status: 'won', convertedClientId: client._id });
  return client._id;
}
