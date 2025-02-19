import React from 'react';

const DashboardWelcome = ({ username, message }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Welcome {username}!</h2>
      <p className="text-gray-300">{message}</p>
    </div>
  );
};

export default DashboardWelcome;