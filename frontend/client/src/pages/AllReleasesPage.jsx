import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Release from '../components/Release'; 
import ReviewSummary from '../components/ReviewSummary';
import { useViewMode } from '../context/ViewModeContext';
 

export default function AllReleases() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useViewMode();

  useEffect(() => {
    async function fetchReleases() {
      setLoading(true);
      const { data, error } = await supabase
        .from('releases')
        .select(`
          release_id, release_id_int, release_name, release_artist_names, 
          release_date, release_cover_url,
          reviews (
            review_score, is_recommended
          )
        `)
        .order('release_date', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setReleases(data.map(release => ({
          ...release,
          averageScore: release.reviews.length > 0
            ? (release.reviews.reduce((sum, review) => sum + review.review_score, 0) / 
               release.reviews.length).toFixed(1)
            : 'N/A',
          recommendedPercentage: release.reviews.length > 0
            ? ((release.reviews.filter(review => review.is_recommended).length / 
                release.reviews.length) * 100).toFixed(1)
            : 'N/A'
        })));
      }
      setLoading(false);
    }
    fetchReleases();
  }, []);



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">Loading releases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Releases</h1>
      
      {releases.length > 0 ? (
        viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800">
                  <th className="py-4 px-4 text-left">Release</th>
                  <th className="py-4 px-4 text-left">Artist</th>
                  <th className="py-4 px-4 text-left">Release Date</th>
                  <th className="py-4 px-4 text-center">Average Score</th>
                  <th className="py-4 px-4 text-center">Recommended</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((release) => (
                  <Release
                    key={release.release_id}
                    type="list"
                    releaseId={release.release_id_int}
                    releaseName={release.release_name}
                    artistNames={release.release_artist_names}
                    releaseDate={release.release_date}
                    coverUrl={release.release_cover_url}
                  >
                    <ReviewSummary
                      type="list" 
                      averageScore={release.averageScore}
                      recommendedPercentage={release.recommendedPercentage}
                    />
                  </Release>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="releases-grid">
            {releases.map((release) => (
              <Release
                key={release.release_id}
                type="grid"
                releaseId={release.release_id_int}
                releaseName={release.release_name}
                artistNames={release.release_artist_names}
                releaseDate={release.release_date}
                coverUrl={release.release_cover_url}
              >
                <ReviewSummary
                  type="grid"
                  averageScore={release.averageScore}
                  recommendedPercentage={release.recommendedPercentage}
                />
              </Release>
            ))}
          </div>
        )
      ) : (
        <p className="text-center text-gray-400">No releases available.</p>
      )}
    </div>
  );
}