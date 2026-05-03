const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const projectRoutes = require('./routes/projects');
const galleryRoutes = require('./routes/gallery');
const adminRoutes = require('./routes/admin');
const { sendContactEmail } = require('./config/email');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await sendContactEmail(name, email, message);

    if (result.ok) {
      return res.status(200).json({ message: 'Message sent successfully' });
    }

    if (result.code === 'NOT_CONFIGURED') {
      return res.status(503).json({
        message:
          'Contact email is not configured on the server. Add EMAIL_USER and EMAIL_PASSWORD (Gmail App Password) to the backend environment.',
        code: result.code,
      });
    }

    return res.status(500).json({
      message: 'Could not send your message. Please try again or use the phone / email on this page.',
      code: result.code || 'SEND_FAILED',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
