import React from 'react';
import PropTypes from 'prop-types';
import { LayoutGrid, List } from 'lucide-react';

const ViewToggle = ({ currentView, onViewChange }) => {
  return (
    <div className="flex justify-end mb-6 gap-2">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-lg flex items-center gap-2 ${
          currentView === 'grid' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        <LayoutGrid size={18} />
        <span>Grid</span>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-lg flex items-center gap-2 ${
          currentView === 'list' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        <List size={18} />
        <span>List</span>
      </button>
    </div>
  );
};

ViewToggle.propTypes = {
  currentView: PropTypes.oneOf(['grid', 'list']).isRequired,
  onViewChange: PropTypes.func.isRequired,
};

export default ViewToggle;