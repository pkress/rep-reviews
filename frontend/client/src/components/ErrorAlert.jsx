import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, X } from 'lucide-react';

const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded relative mb-6">
      <div className="flex items-start">
        <AlertTriangle className="flex-shrink-0 mr-2 h-5 w-5" />
        <div className="flex-1">
          {message}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-red-200 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

ErrorAlert.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func
};

export default ErrorAlert;