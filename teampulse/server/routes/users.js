const express = require('express');
const router  = express.Router();
const { getAllUsers, updateStatus } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/',        protect, getAllUsers);
router.patch('/status', protect, updateStatus);

module.exports = router;
