// services/emailService.js

const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure the email transporter
// This example uses SendGrid, but you can use any SMTP service
// Configure Zeptomail transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.ZEPTOMAIL_USER,
    pass: process.env.ZEPTOMAIL_API_KEY
  }
});

/**
 * Send an email to a single recipient
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content
 * @returns {Promise} - Result of sending email
 */
const sendEmail = async (to, subject, text, html) => {
  const message = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

/**
 * Send release submission reminder email
 * @param {string} to - User's email
 * @param {string} username - User's name or username
 */
const sendReleaseReminder = async (to, username) => {
  const subject = "Friday Reminder: Submit Your Music Releases!";
  const text = `Hey ${username}! It's Friday - time to submit your favorite new music releases for the community to review. Log in now to submit: http://yourdomain.com/dashboard`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366F1;">Friday Music Submission Reminder</h2>
      <p>Hey ${username}!</p>
      <p>It's Friday - time to submit your favorite new music releases for the community to review.</p>
      <p><a href="http://yourdomain.com/dashboard" style="display: inline-block; background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Submit Releases Now</a></p>
      <p>Don't miss out on adding your voice to the community's music discovery!</p>
      <p>Happy listening,<br>The Rep-Reviews Team</p>
    </div>
  `;

  return sendEmail(to, subject, text, html);
};

/**
 * Send review reminder email
 * @param {string} to - User's email
 * @param {string} username - User's name or username
 * @param {Object} assignment - Details about the assigned release
 */
const sendReviewReminder = async (to, username, assignment) => {
  // If user has an assignment, include release details
  let subject, text, html;
  
  if (assignment) {
    subject = `Tuesday Reminder: Review "${assignment.release_name}"!`;
    text = `Hey ${username}! It's Tuesday - time to review your assigned release: "${assignment.release_name}" by ${assignment.release_artist_names}. Log in now to submit your review: http://yourdomain.com/dashboard`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366F1;">Tuesday Review Reminder</h2>
        <p>Hey ${username}!</p>
        <p>It's time to review your assigned release:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 8px; display: flex; align-items: center;">
          <img src="${assignment.release_cover_url}" alt="Album cover" style="width: 80px; height: 80px; object-fit: cover; margin-right: 15px;">
          <div>
            <h3 style="margin: 0 0 5px 0;">${assignment.release_name}</h3>
            <p style="margin: 0; color: #666;">${assignment.release_artist_names}</p>
          </div>
        </div>
        <p><a href="http://yourdomain.com/dashboard" style="display: inline-block; background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Review Now</a></p>
        <p>Your input helps the community discover great music!</p>
        <p>Happy listening,<br>The Rep-Reviews Team</p>
      </div>
    `;
  } else {
    // Generic reminder if they don't have an assignment yet
    subject = "Tuesday Reminder: Get Your Music Review Assignment!";
    text = `Hey ${username}! It's Tuesday - time to get your weekly music review assignment. Log in now to get started: http://yourdomain.com/dashboard`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366F1;">Tuesday Review Reminder</h2>
        <p>Hey ${username}!</p>
        <p>It's Tuesday - time to get your weekly music review assignment.</p>
        <p><a href="http://yourdomain.com/dashboard" style="display: inline-block; background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Get Assignment</a></p>
        <p>Your input helps the community discover great music!</p>
        <p>Happy listening,<br>The Rep-Reviews Team</p>
      </div>
    `;
  }

  return sendEmail(to, subject, text, html);
};

/**
 * Send bulk emails
 * @param {Array} recipients - Array of {email, username, [assignment]} objects
 * @param {string} emailType - 'release' or 'review'
 */
const sendBulkEmails = async (recipients, emailType) => {
  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const recipient of recipients) {
    try {
      let result;
      if (emailType === 'release') {
        result = await sendReleaseReminder(recipient.email, recipient.username);
      } else if (emailType === 'review') {
        result = await sendReviewReminder(recipient.email, recipient.username, recipient.assignment);
      }

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({
          email: recipient.email,
          error: result.error.message
        });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: recipient.email,
        error: error.message
      });
    }
  }

  return results;
};

module.exports = {
  sendEmail,
  sendReleaseReminder,
  sendReviewReminder,
  sendBulkEmails
};