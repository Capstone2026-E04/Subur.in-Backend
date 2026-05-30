const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Semua endpoint untuk device wajib menggunakan autentikasi (JWT)
router.use(authMiddleware);

// Route untuk pendaftaran & manajemen device
router.post('/', deviceController.registerDevice);
router.get('/', deviceController.getMyDevices);
router.get('/discovered', deviceController.getDiscoveredDevices);
router.get('/:id/recommendation', deviceController.getDeviceRecommendation);
router.patch('/:id', deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);

module.exports = router;
