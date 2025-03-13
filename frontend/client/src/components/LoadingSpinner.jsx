import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  let spinnerSize;
  switch (size) {
    case 'small':
      spinnerSize = 'w-5 h-5';
      break;
    case 'large':
      spinnerSize = 'w-12 h-12';
      break;
    case 'medium':
    default:
      spinnerSize = 'w-8 h-8';
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${spinnerSize} border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3`}></div>
      {message && <p className="text-gray-400">{message}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  message: PropTypes.string
};

export default LoadingSpinner;