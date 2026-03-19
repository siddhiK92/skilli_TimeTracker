const User = require('../models/User');

// ── GET /api/users ── (all team members for dashboard)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH /api/users/status ── (toggle On Leave)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['online', 'offline', 'leave'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status value' });

    const user = await User.findById(req.user._id);
    user.status = status;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, updateStatus };
