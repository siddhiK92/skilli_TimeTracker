const jwt           = require('jsonwebtoken');
const User          = require('../models/User');
const AttendanceLog = require('../models/AttendanceLog');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '12h' });

const todayKey = () => new Date().toISOString().slice(0, 10);

const register = async (req, res) => {
  try {
    const { name, email, password, role, color } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const autoUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists)
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      username: autoUsername,
      email: email.toLowerCase(),
      password,
      role: role || 'Team Member',
      color: color || '#7367F0',
    });

    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });

    const now = new Date();
    user.status     = 'online';
    user.loginTime  = now;
    user.logoutTime = null;
    await user.save();

    await AttendanceLog.findOneAndUpdate(
      { user: user._id, date: todayKey() },
      { loginTime: now, logoutTime: null, status: 'present' },
      { upsert: true, new: true }
    );

    res.json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now  = new Date();
    user.status     = 'offline';
    user.logoutTime = now;
    await user.save();

    const log = await AttendanceLog.findOne({ user: user._id, date: todayKey() });
    if (log) {
      log.logoutTime = now;
      log.workingMs  = log.loginTime ? now - new Date(log.loginTime) : 0;
      await log.save();
    }

    res.json({ message: 'Punched out successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, logout, getMe };