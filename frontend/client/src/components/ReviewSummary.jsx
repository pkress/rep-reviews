import React from 'react';
import PropTypes from 'prop-types';

export function ReviewSummary({ averageScore, recommendedPercentage, type }) {
  return (
    <>
      {type === 'grid' ? (
        <div className="review-summary space-y-1">
          <p className="text-gray-300">
            Average (% Recommend): {averageScore} ({recommendedPercentage}%)
          </p>
        </div>
      ) : (
        <>
          <td className="py-4 px-4 text-center">{averageScore}</td>
          <td className="py-4 px-4 text-center">{recommendedPercentage}%</td>
        </>
      )}
    </>
  );
}

ReviewSummary.propTypes = {
  averageScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  recommendedPercentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  type: PropTypes.oneOf(['grid', 'list']).isRequired
};

export default ReviewSummary;