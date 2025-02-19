import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Release from '../components/Release';
import ViewToggle from '../components/ViewToggle';
import { Music, Hash } from 'lucide-react';
import SpotifyLogo from '../assets/spotify-logo.svg'; // Import the SVG
import { useViewMode } from '../context/ViewModeContext';


export function UserReviewSummary({ score, recommended, reviewText, type }) {
  return (
    <>
      {type === 'grid' ? (
        <div className="bg-gray-700 p-3 rounded-lg mt-2">
          <div className="flex justify-between mb-2">
            <span className="text-sm">Score: {score}</span>
            <span className="text-sm">{recommended ? '👍' : '👎'}</span>
          </div>
          <p className="text-sm text-gray-300">{reviewText}</p>
        </div>
      ) : (
        <>
          <td className="py-4 px-4 text-center">{score}</td>
          <td className="py-4 px-4 text-center">{recommended ? '👍' : '👎'}</td>
          <td className="py-4 px-4">{reviewText}</td>
        </>
      )}
    </>
  );
}

export default function UserPage() {
  const { userName } = useParams();
  const [reviews, setReviews] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { viewMode } = useViewMode();

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.log('Error downloading image: ', error.message);
    }
  }

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      try {
        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select(`
            id, 
            username, 
            avatar_url, 
            full_name, 
            lastfm_username,
            spotify_username
          `)
          .eq('username', userName)
          .single();

        if (userError) throw userError;

        setProfile(userData);

        // Download avatar if exists
        if (userData.avatar_url) {
          await downloadImage(userData.avatar_url);
        }

        // Fetch reviews
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select(`
            review_id, review_score, is_recommended, review_text,
            releases (
              release_id, release_name, release_artist_names, 
              release_cover_url, release_date, release_id_int
            )
          `)
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false });

        if (reviewError) throw reviewError;
        setReviews(reviewData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();

    // Cleanup function to revoke object URLs
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [userName]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-6">
          <h1 className="text-2xl font-bold mb-2">{profile.username}</h1>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${profile.username}'s avatar`}
              className="avatar" // Apply the CSS class
            />
          ) : (
            <div> <p>(No Profile Picture)</p></div>
          )}

          <div className="flex-1">
            {profile.full_name && (
              <p className="text-gray-400 mb-4">{profile.full_name}</p>
            )}

            <div className="flex flex-wrap gap-4">
              {profile.lastfm_username && (
                <a
                  href={`https://www.last.fm/user/${profile.lastfm_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Music size={18} />
                  <span>{profile.lastfm_username}</span>
                </a>
              )}
              {profile.spotify_username && (
                <a
                  href={`https://open.spotify.com/user/${profile.spotify_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <img src={SpotifyLogo} alt="Spotify" className="spotify-logo" /> {/* Use CSS class */}
                  <span>{profile.spotify_username}</span>
                </a>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="bg-gray-700 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-400">Reviews</p>
              <p className="text-2xl font-bold">{reviews.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle and Reviews */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="py-4 px-4 text-left">Release</th>
                    <th className="py-4 px-4 text-left">Release Date</th>
                    <th className="py-4 px-4 text-center">Score</th>
                    <th className="py-4 px-4 text-center">Recommended</th>
                    <th className="py-4 px-4">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <Release
                      key={review.releases.release_id}
                      type="list"
                      releaseId={review.releases.release_id_int}
                      releaseName={review.releases.release_name}
                      artistNames={review.releases.release_artist_names}
                      releaseDate={review.releases.release_date}
                      coverUrl={review.releases.release_cover_url}
                    >
                      <UserReviewSummary
                        score={review.review_score}
                        recommended={review.is_recommended}
                        reviewText={review.review_text}
                        type="list"
                      />
                    </Release>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="releases-grid">
              {reviews.map((review) => (
                <Release
                  key={review.releases.release_id}
                  type="grid"
                  releaseId={review.releases.release_id_int}
                  releaseName={review.releases.release_name}
                  artistNames={review.releases.release_artist_names}
                  releaseDate={review.releases.release_date}
                  coverUrl={review.releases.release_cover_url}
                >
                  <UserReviewSummary
                    score={review.review_score}
                    recommended={review.is_recommended}
                    reviewText={review.review_text}
                    type="grid"
                  />
                </Release>
              ))}
            </div>
          )
        ) : (
          <p className="text-center text-gray-400">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}