const express = require('express');
const router = express.Router();
const { login, getMe, refreshAccessToken, logout, changePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { loginSchema, changePasswordSchema } = require('../validators/authValidator');

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.put('/change-password', auth, validate(changePasswordSchema), changePassword);

module.exports = router;
