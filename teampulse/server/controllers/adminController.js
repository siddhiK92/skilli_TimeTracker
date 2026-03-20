const User          = require('../models/User');
const AttendanceLog = require('../models/AttendanceLog');
const EOD           = require('../models/EOD');

const todayKey = () => new Date().toISOString().slice(0, 10);
const msToHours = (ms) => {
  if (!ms) return '0h 0m';
  return `${Math.floor(ms/3600000)}h ${Math.floor((ms%3600000)/60000)}m`;
};

const getOverview = async (req, res) => {
  try {
    const today = todayKey();
    const [totalUsers, activeUsers, onlineUsers, onLeaveUsers, todayLogs, todayEODs] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      User.countDocuments({ isAdmin: false, isActive: true }),
      User.countDocuments({ status: 'online' }),
      User.countDocuments({ status: 'leave' }),
      AttendanceLog.find({ date: today }).populate('user', 'name username role color'),
      EOD.countDocuments({ date: today }),
    ]);
    const completedLogs = todayLogs.filter(l => l.logoutTime && l.workingMs > 0);
    const avgMs = completedLogs.length ? completedLogs.reduce((s,l) => s + l.workingMs, 0) / completedLogs.length : 0;
    res.json({
      stats: {
        totalUsers, activeUsers, onlineUsers, onLeaveUsers,
        offlineUsers: activeUsers - onlineUsers - onLeaveUsers,
        todayPresent: todayLogs.length, todayEODs,
        avgWorkingHours: msToHours(avgMs),
      },
      todayLogs,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).sort({ name: 1 });
    const today = todayKey();
    const logs  = await AttendanceLog.find({ date: today });
    const logMap = {};
    logs.forEach(l => { logMap[l.user.toString()] = l; });
    const result = users.map(u => ({ ...u.toJSON(), todayLog: logMap[u._id.toString()] || null }));
    res.json({ users: result });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const [logs, eods] = await Promise.all([
      AttendanceLog.find({ user: user._id }).sort({ date: -1 }).limit(30),
      EOD.find({ user: user._id }).sort({ date: -1 }).limit(30),
    ]);
    const totalMs = logs.reduce((s,l) => s + (l.workingMs||0), 0);
    res.json({
      user, logs, eods,
      stats: {
        totalDaysPresent: logs.filter(l=>l.status==='present').length,
        totalDaysLeave:   logs.filter(l=>l.status==='leave').length,
        totalWorkingHours: msToHours(totalMs),
        eodSubmissions: eods.length,
      },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateUser = async (req, res) => {
  try {
    const { role, isActive, isAdmin, color, name } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name     !== undefined) user.name     = name;
    if (role     !== undefined) user.role     = role;
    if (color    !== undefined) user.color    = color;
    if (isActive !== undefined) user.isActive = isActive;
    if (isAdmin  !== undefined) user.isAdmin  = isAdmin;
    await user.save();
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot delete your own account' });
    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      AttendanceLog.deleteMany({ user: req.params.id }),
      EOD.deleteMany({ user: req.params.id }),
    ]);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const overrideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['online','offline','leave'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await AttendanceLog.findOneAndUpdate(
      { user: req.params.id, date: todayKey() },
      { status: status === 'leave' ? 'leave' : 'present' }
    );
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAttendanceReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to)   query.date.$lte = to;
    }
    const logs = await AttendanceLog.find(query)
      .populate('user', 'name username role color')
      .sort({ date: -1 });
    res.json({ logs });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllEODs = async (req, res) => {
  try {
    const { date, userId } = req.query;
    const query = {};
    if (date)   query.date = date;
    if (userId) query.user = userId;
    const eods = await EOD.find(query)
      .populate('user', 'name username role color')
      .sort({ date: -1 });
    res.json({ eods });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: 'Min 6 characters' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = newPassword;
    await user.save();
    res.json({ message: `Password reset for ${user.name}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getOverview, getAllUsers, getUserDetail, updateUser,
  deleteUser, overrideStatus, getAttendanceReport, getAllEODs, resetPassword,
};