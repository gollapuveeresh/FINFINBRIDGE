import CaseNote from '../models/CaseNote.js';

// GET all case notes for the logged-in consultant
export const getCaseNotes = async (req, res) => {
  try {
    const notes = await CaseNote.find({ consultantId: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({ status: 'success', data: notes });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST or PUT: upsert a case note for a specific client
export const saveOrUpdateNote = async (req, res) => {
  try {
    const { clientId, clientName, clientCompany, category, text } = req.body;
    if (!clientId || !clientName) {
      return res.status(400).json({ status: 'error', message: 'clientId and clientName are required' });
    }

    const note = await CaseNote.findOneAndUpdate(
      { consultantId: req.user._id, clientId },
      { clientName, clientCompany, category, text, consultantId: req.user._id, clientId },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(200).json({ status: 'success', data: note });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE a specific case note
export const deleteCaseNote = async (req, res) => {
  try {
    await CaseNote.findOneAndDelete({ consultantId: req.user._id, clientId: req.params.clientId });
    res.status(200).json({ status: 'success', message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
