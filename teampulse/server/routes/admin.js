const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const {
  getOverview, getAllUsers, getUserDetail, updateUser,
  deleteUser, overrideStatus, getAttendanceReport,
  getAllEODs, resetPassword,
} = require('../controllers/adminController');

router.use(protect, isAdmin);

router.get('/overview',                  getOverview);
router.get('/users',                     getAllUsers);
router.get('/users/:id',                 getUserDetail);
router.patch('/users/:id',               updateUser);
router.delete('/users/:id',              deleteUser);
router.patch('/users/:id/status',        overrideStatus);
router.patch('/users/:id/reset-password', resetPassword);
router.get('/attendance',                getAttendanceReport);
router.get('/eod',                       getAllEODs);

module.exports = router;