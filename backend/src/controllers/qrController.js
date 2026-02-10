const QRSession = require('../models/QRSession');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const generateQR = asyncHandler(async (req, res) => {
  const { type = 'checkin', expiryMinutes = 5, department } = req.body;

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  const session = await QRSession.create({
    token,
    type,
    createdBy: req.user._id,
    department: department || null,
    expiresAt,
  });

  const qrData = JSON.stringify({
    token: session.token,
    type: session.type,
    expiresAt: session.expiresAt.toISOString(),
  });

  const qrImage = await QRCode.toDataURL(qrData, {
    width: 400,
    margin: 2,
    color: {
      dark: '#1C1917',
      light: '#FAFAF9',
    },
  });

  res.status(201).json({
    success: true,
    data: {
      session,
      qrImage,
    },
  });
});

const validateSession = asyncHandler(async (req, res) => {
  const session = await QRSession.findOne({ token: req.params.token });

  if (!session) {
    throw new ApiError(404, 'QR session not found.');
  }

  const isExpired = new Date() > session.expiresAt;

  res.json({
    success: true,
    data: {
      ...session.toObject(),
      isExpired,
      isValid: !isExpired,
    },
  });
});

const getActiveSessions = asyncHandler(async (req, res) => {
  const sessions = await QRSession.find({
    expiresAt: { $gt: new Date() },
  })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: sessions,
  });
});

const revokeSession = asyncHandler(async (req, res) => {
  const session = await QRSession.findOneAndDelete({ token: req.params.token });

  if (!session) {
    throw new ApiError(404, 'QR session not found.');
  }

  res.json({
    success: true,
    message: 'QR session revoked.',
  });
});

module.exports = { generateQR, validateSession, getActiveSessions, revokeSession };
