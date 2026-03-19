const EOD  = require('../models/EOD');
const User = require('../models/User');

// Returns today's date as YYYY-MM-DD in IST (UTC+5:30)
const todayKey = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.toISOString().slice(0, 10);
};

// ── POST /api/eod ── submit or update today's EOD
const submitEOD = async (req, res) => {
  try {
    const { projects, completed, planned, date } = req.body;
    const day = date || todayKey();

    const eod = await EOD.findOneAndUpdate(
      { user: req.user._id, date: day },
      { projects, completed, planned },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ eod });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/eod/my ── current user's EOD history
const getMyEODs = async (req, res) => {
  try {
    const eods = await EOD.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ eods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/eod/today ── all users' EOD for today (for dashboard)
const getTodayEODs = async (req, res) => {
  try {
    const eods = await EOD.find({ date: todayKey() }).populate('user', 'name username');
    res.json({ eods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/eod/user/:userId ── specific user's EOD history
const getUserEODs = async (req, res) => {
  try {
    const eods = await EOD.find({ user: req.params.userId }).sort({ date: -1 });
    res.json({ eods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitEOD, getMyEODs, getTodayEODs, getUserEODs };
