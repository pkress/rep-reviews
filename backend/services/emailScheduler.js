// services/emailScheduler.js

const cron = require('node-cron');
const { supabase } = require('../supabaseClient');
const emailService = require('./emailService');
const { getLastFriday } = require('../utils/dateUtils');

/**
 * Get active users for email notifications
 * @returns {Promise<Array>} Array of user objects with email and username
 */
const getActiveUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        email_notifications,
        auth_users:id (email)
      `)
      .eq('email_notifications', true); // Only get users who opted in for emails

    if (error) throw error;

    // Format the results
    return data.map(user => ({
      id: user.id,
      username: user.username,
      email: user.auth_users.email
    }));
  } catch (error) {
    console.error('Error fetching active users:', error);
    return [];
  }
};

/**
 * Get user assignments for the current week
 * @param {Array} userIds - Array of user IDs to check
 * @returns {Promise<Object>} - Map of user IDs to their assignments
 */
const getUserAssignments = async (userIds) => {
  try {
    const lastFriday = getLastFriday();
    const lastFridayISO = lastFriday.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('release_assignments')
      .select(`
        assignment_id,
        user_id,
        release_id,
        is_completed,
        releases (
          release_id,
          release_name,
          release_artist_names,
          release_cover_url
        )
      `)
      .eq('release_week', lastFridayISO)
      .in('user_id', userIds);

    if (error) throw error;

    // Create a map of user IDs to their assignments
    const assignmentMap = {};
    data.forEach(assignment => {
      assignmentMap[assignment.user_id] = {
        assignment_id: assignment.assignment_id,
        is_completed: assignment.is_completed,
        release_id: assignment.release_id,
        release_name: assignment.releases.release_name,
        release_artist_names: assignment.releases.release_artist_names,
        release_cover_url: assignment.releases.release_cover_url
      };
    });

    return assignmentMap;
  } catch (error) {
    console.error('Error fetching user assignments:', error);
    return {};
  }
};

/**
 * Send Friday release submission reminders
 */
const sendFridayReminders = async () => {
  try {
    console.log('Sending Friday release submission reminders...');
    
    const activeUsers = await getActiveUsers();
    if (activeUsers.length === 0) {
      console.log('No active users found for reminders.');
      return;
    }

    const recipients = activeUsers.map(user => ({
      email: user.email,
      username: user.username
    }));

    const results = await emailService.sendBulkEmails(recipients, 'release');
    console.log(`Friday reminders sent: ${results.successful} successful, ${results.failed} failed`);
    
    if (results.failed > 0) {
      console.error('Failed emails:', results.errors);
    }
  } catch (error) {
    console.error('Error sending Friday reminders:', error);
  }
};

/**
 * Send Tuesday review reminders
 */
const sendTuesdayReminders = async () => {
  try {
    console.log('Sending Tuesday review reminders...');
    
    const activeUsers = await getActiveUsers();
    if (activeUsers.length === 0) {
      console.log('No active users found for reminders.');
      return;
    }

    const userIds = activeUsers.map(user => user.id);
    const assignmentMap = await getUserAssignments(userIds);

    // Prepare recipients with their assignments
    const recipients = activeUsers.map(user => {
      const assignment = assignmentMap[user.id];
      // Only include non-completed assignments
      return {
        email: user.email,
        username: user.username,
        assignment: (assignment && !assignment.is_completed) ? assignment : null
      };
    });

    const results = await emailService.sendBulkEmails(recipients, 'review');
    console.log(`Tuesday reminders sent: ${results.successful} successful, ${results.failed} failed`);
    
    if (results.failed > 0) {
      console.error('Failed emails:', results.errors);
    }
  } catch (error) {
    console.error('Error sending Tuesday reminders:', error);
  }
};

/**
 * Schedule email reminders
 * - Friday 10:00 AM: Release submission reminders
 * - Tuesday 10:00 AM: Review reminders
 */
const scheduleReminders = () => {
  // Run Friday reminders at 10:00 AM
  cron.schedule('0 10 * * 5', sendFridayReminders, {
    timezone: 'America/New_York' // Adjust the timezone as needed
  });
  console.log('Scheduled Friday release submission reminders for 10:00 AM');

  // Run Tuesday reminders at 10:00 AM
  cron.schedule('0 10 * * 2', sendTuesdayReminders, {
    timezone: 'America/New_York' // Adjust the timezone as needed
  });
  console.log('Scheduled Tuesday review reminders for 10:00 AM');
};

// For testing purposes, expose functions to manually trigger
const manualTrigger = {
  fridayReminders: sendFridayReminders,
  tuesdayReminders: sendTuesdayReminders
};

module.exports = {
  scheduleReminders,
  manualTrigger
};