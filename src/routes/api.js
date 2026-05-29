const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Subur.in API Router v1 aktif!',
    endpoints: {
      auth: '/api/auth/google',
      users: {
        getProfile: 'GET /api/users/me',
        updateProfile: 'PATCH /api/users/me',
        deleteAccount: 'DELETE /api/users/me',
      }
    }
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
