// server/routes/emailRoutes.js

const express = require('express');
const router = express.Router();
const emailScheduler = require('../services/emailScheduler');
const emailService = require('../services/emailService');

// Middleware to check if the requester is an admin
const isAdmin = (req, res, next) => {
  // In production, add proper authentication checks here
  // For example, check a JWT token or validate against an admin list
  const adminKey = req.headers['admin-key'];
  if (adminKey === process.env.ADMIN_API_KEY) {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
};

// Manually trigger Friday reminders
router.post('/trigger-friday-reminders', isAdmin, async (req, res) => {
  try {
    await emailScheduler.manualTrigger.fridayReminders();
    res.json({ success: true, message: 'Friday reminders triggered successfully' });
  } catch (error) {
    console.error('Error triggering Friday reminders:', error);
    res.status(500).json({ error: 'Failed to trigger Friday reminders' });
  }
});

// Manually trigger Tuesday reminders
router.post('/trigger-tuesday-reminders', isAdmin, async (req, res) => {
  try {
    await emailScheduler.manualTrigger.tuesdayReminders();
    res.json({ success: true, message: 'Tuesday reminders triggered successfully' });
  } catch (error) {
    console.error('Error triggering Tuesday reminders:', error);
    res.status(500).json({ error: 'Failed to trigger Tuesday reminders' });
  }
});

// Send a test email to a specific address
router.post('/send-test-email', isAdmin, async (req, res) => {
  try {
    const { email, type } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    let result;
    if (type === 'release') {
      result = await emailService.sendReleaseReminder(email, 'Test User');
    } else if (type === 'review') {
      // Create test assignment data
      const testAssignment = {
        release_name: 'Test Album',
        release_artist_names: 'Test Artist',
        release_cover_url: 'https://via.placeholder.com/300'
      };
      result = await emailService.sendReviewReminder(email, 'Test User', testAssignment);
    } else {
      return res.status(400).json({ error: 'Invalid email type. Use "release" or "review".' });
    }
    
    if (result.success) {
      res.json({ success: true, message: 'Test email sent successfully', messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Failed to send test email', details: result.error });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

module.exports = router;