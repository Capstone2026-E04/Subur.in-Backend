require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./database/connections/prisma_client');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    return res.status(200).json({
      status: 'UP',
      message: 'Server Subur.in-Backend berjalan normal dan terkoneksi ke Supabase!',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      status: 'DOWN',
      message: 'Server berjalan, namun GAGAL terkoneksi ke database Supabase.',
      error: error.message,
      timestamp: new Date()
    });
  }
});

app.get('/', (req, res) => {
  res.send();
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🌱 Subur.in Backend running on port: ${PORT}`);
  console.log(`🚀 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`===================================================`);
});
