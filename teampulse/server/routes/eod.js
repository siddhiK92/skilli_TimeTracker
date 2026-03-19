const express = require('express');
const router  = express.Router();
const { submitEOD, getMyEODs, getTodayEODs, getUserEODs } = require('../controllers/eodController');
const { protect } = require('../middleware/auth');

router.post('/',              protect, submitEOD);
router.get('/my',             protect, getMyEODs);
router.get('/today',          protect, getTodayEODs);
router.get('/user/:userId',   protect, getUserEODs);

module.exports = router;
