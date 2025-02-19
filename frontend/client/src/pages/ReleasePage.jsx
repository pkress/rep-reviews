import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ReleasePage() {
  const { id_int } = useParams();
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelease() {
      const { data, error } = await supabase
        .from('releases')
        .select(`
          release_id, release_name, release_artist_names, release_date, 
          release_cover_url, release_id_int,
          reviews (
            review_id, user_id, review_score, is_recommended, review_text, 
            profiles ( id, username )
          )
        `)
        .eq('release_id_int', id_int)
        .single();

      if (error) {
        console.error('Error fetching release:', error);
      } else {
        const processedRelease = {
          ...data,
          averageScore: data.reviews.length > 0
            ? (data.reviews.reduce((sum, r) => sum + r.review_score, 0) / 
               data.reviews.length).toFixed(1)
            : 'N/A',
          recommendedPercentage: data.reviews.length > 0
            ? ((data.reviews.filter(r => r.is_recommended).length / 
                data.reviews.length) * 100).toFixed(1)
            : 'N/A'
        };
        setRelease(processedRelease);
      }
      setLoading(false);
    }

    fetchRelease();
  }, [id_int]);

  if (loading) {
    return (
      <div className="release-page-container">
        <p>Loading release...</p>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="release-page-container">
        <p>Release not found.</p>
      </div>
    );
  }

  return (
    <div className="release-page-container">
      {/* Header Section */}
      <div className="release-page-header">
        <div className="release-page-cover">
          <img
            src={release.release_cover_url}
            alt={`${release.release_name} cover`}
            className="release-page-image"
          />
        </div>
        <div className="release-page-info">
          <h1 className="release-page-title">{release.release_name}</h1>
          <p className="release-page-artist">{release.release_artist_names}</p>
          <p className="release-page-date">
            {new Date(release.release_date).toLocaleDateString()}
          </p>
          <div className="release-page-stats">
            <div className="stat-item">
              <span className="stat-label">Average Score</span>
              <span className="stat-value">{release.averageScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Recommended</span>
              <span className="stat-value">{release.recommendedPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="reviews-title">Reviews</h2>
        <div className="reviews-grid">
          {release.reviews.map((review) => (
            <div key={review.review_id} className="review-card">
              <div className="review-header">
                <Link to={`/user/${review.profiles.username}`} className="reviewer-name">
                  {review.profiles.username}
                </Link>
                <div className="review-stats">
                  <span className="review-score">{review.review_score}/10</span>
                  <span className="review-recommendation">
                    {review.is_recommended ? '👍 Recommended' : '👎 Not Recommended'}
                  </span>
                </div>
              </div>
              <p className="review-text">{review.review_text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}