import React from 'react';
import { getLastFriday, getLastLastFriday, dateFormatters } from '../utils/dateUtils';

const DashboardWelcome = ({ username, message, phase }) => {
  const today = new Date();
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
  
  // Get date ranges for eligible releases
  const lastFriday = getLastFriday();
  const lastLastSaturday = new Date(getLastLastFriday());
  lastLastSaturday.setDate(lastLastSaturday.getDate() + 1); // Get Saturday after last last Friday
  
  // Format dates for display
  const formattedLastFriday = lastFriday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const formattedLastLastSaturday = lastLastSaturday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  // Determine which context message to show based on the phase
  let contextMessage = null;
  
  if (phase === 'submission') {
    contextMessage = (
      <div className="bg-gray-800 p-4 rounded-lg mt-4">
        <p className="text-gray-300">
          It's {dayOfWeek} — submit an album that came out between {formattedLastLastSaturday} and {formattedLastFriday}.
        </p>
        <p className="text-gray-400 mt-2">
          Check back on Tuesday for your assignment!
        </p>
      </div>
    );
  } else if (phase === 'review') {
    contextMessage = (
      <div className="bg-gray-800 p-4 rounded-lg mt-4">
        <p className="text-gray-300">
          Make sure to submit your review before Friday! We won't accept late reviews!
        </p>
        <p className="text-gray-400 mt-2">
          Check back on Friday for the fresh crop of reviews, and to submit more albums for the next round!
        </p>
      </div>
    );
  } else if (phase === 'completed') {
    contextMessage = (
      <div className="bg-gray-800 p-4 rounded-lg mt-4">
        <p className="text-gray-300">
          Thanks for submitting your review! 
        </p>
        <p className="text-gray-400 mt-2">
          Check back on Friday for the fresh crop of reviews, and to submit more albums for the next round!
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Welcome {username}!</h2>
      <p className="text-gray-300 mb-2">{message}</p>
      <p className="text-gray-300 mb-2">{contextMessage}</p>
    </div>
  );
};

export default DashboardWelcome;