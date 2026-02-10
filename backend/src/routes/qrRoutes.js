const express = require('express');
const router = express.Router();
const { generateQR, validateSession, getActiveSessions, revokeSession } = require('../controllers/qrController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/generate', auth, authorize('admin', 'manager'), generateQR);
router.get('/active', auth, authorize('admin', 'manager'), getActiveSessions);
router.get('/session/:token', auth, validateSession);
router.delete('/session/:token', auth, authorize('admin', 'manager'), revokeSession);

module.exports = router;
