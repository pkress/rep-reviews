import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function Release({
  type,
  releaseId,
  releaseName,
  artistNames,
  releaseDate,
  coverUrl,
  children,
}) {
  if (type === 'grid') {
    return (
      <div className="release-card">
        <Link to={`/release/${releaseId}`} className="release-link">
          <div className="release-cover">
            <img
              src={coverUrl}
              alt={`${releaseName} cover`}
              className="release-image"
            />
          </div>
          <div className="release-info">
            <h3 className="release-title">{releaseName}</h3>
            <p className="release-artist">
              {Array.isArray(artistNames) ? artistNames.join(', ') : artistNames}
            </p>
            <p className="release-date">
              {new Date(releaseDate).toLocaleDateString()}
            </p>
          </div>
          {children && (
            <div className="release-details">
              {children}
            </div>
          )}
        </Link>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <tr className="release-row">
        <td className="release-cell">
          <Link to={`/release/${releaseId}`} className="release-link-list">
            <img
              src={coverUrl}
              alt={`${releaseName} cover`}
              className="release-image-small"
            />
            <span className="release-title-list">{releaseName}</span>
          </Link>
        </td>
        <td className="release-cell">
          {Array.isArray(artistNames) ? artistNames.join(', ') : artistNames}
        </td>
        <td className="release-cell">
          {new Date(releaseDate).toLocaleDateString()}
        </td>
        {children}
      </tr>
    );
  }

  return null;
}

Release.propTypes = {
  type: PropTypes.oneOf(['grid', 'list']).isRequired,
  releaseId: PropTypes.number.isRequired,
  releaseName: PropTypes.string.isRequired,
  artistNames: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  releaseDate: PropTypes.string.isRequired,
  coverUrl: PropTypes.string.isRequired,
  children: PropTypes.node,
};