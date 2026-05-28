const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Subur.in API Router v1 aktif!',
    endpoints: {
      auth: '/api/auth/google'
    }
  });
});

router.use('/auth', authRoutes);

module.exports = router;
