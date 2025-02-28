// components/EmailPreferences.jsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const EmailPreferences = ({ emailNotifications, userId, onUpdate }) => {
  const [notifications, setNotifications] = useState(emailNotifications);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications: !notifications,
          updated_at: new Date()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(!notifications);
      
      // Call parent update function if provided
      if (onUpdate) {
        onUpdate(!notifications);
      }
    } catch (error) {
      console.error('Error updating email preferences:', error);
      alert('Failed to update email preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-preferences bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Email Notifications</h3>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 mb-1">Receive reminder emails</p>
          <p className="text-sm text-gray-400">
            Get Friday reminders to submit releases and Tuesday reminders to submit reviews.
          </p>
        </div>
        
        <div className="ml-4">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={notifications}
              onChange={handleToggle}
              disabled={loading}
            />
            <div className={`relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer 
                            ${notifications ? 'peer-checked:bg-blue-600' : ''} 
                            peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                            after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                            after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}>
            </div>
          </label>
        </div>
      </div>
      
      {loading && <p className="text-sm text-gray-400 mt-2">Updating preferences...</p>}
    </div>
  );
};

export default EmailPreferences;