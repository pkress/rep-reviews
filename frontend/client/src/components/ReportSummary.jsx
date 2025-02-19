import { useState, useEffect } from 'react';
import Release from './Release';
import ReviewSummary from './ReviewSummary';
import { supabase } from '../supabaseClient';
import { useViewMode } from '../context/ViewModeContext';

// Separate component for displaying review stats
const WeeklyStats = ({ data }) => {
  const totalReleases = data.length;
  const totalSubmissions = data.reduce((sum, d) => sum + d.total_submissions, 0);
  const totalReviews = data.reduce((sum, d) => sum + d.reviews.length, 0);

  return (
    <div className="stats-summary grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-800 rounded-lg p-6 mb-6">
      <div className="stat-item text-center">
        <p className="text-sm text-gray-400">Total Releases</p>
        <p className="text-2xl font-bold text-white">{totalReleases}</p>
      </div>
      <div className="stat-item text-center">
        <p className="text-sm text-gray-400">Total Submissions</p>
        <p className="text-2xl font-bold text-white">{totalSubmissions}</p>
      </div>
      <div className="stat-item text-center">
        <p className="text-sm text-gray-400">Total Reviews</p>
        <p className="text-2xl font-bold text-white">{totalReviews}</p>
      </div>
    </div>
  );
};
 

export default function ReportSummary({ releaseWeek, canViewLatest }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useViewMode();

  useEffect(() => {
    async function fetchWeeklyData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('releases')
          .select(`
            release_id, release_id_int, release_name, release_artist_names,
            release_date, release_cover_url,
            reviews (
              review_score, is_recommended
            ),
            release_assignments (
              is_completed
            ),
            release_submissions (
              release_week
            )
          `)
          .eq('release_week', releaseWeek);

        if (error) throw error;

        const processedData = data.map(release => ({
          ...release,
          total_submissions: release.release_submissions.length,
          total_assignments: release.release_assignments.length,
          averageScore: release.reviews.length > 0
            ? (release.reviews.reduce((sum, r) => sum + r.review_score, 0) / 
               release.reviews.length).toFixed(1)
            : 'N/A',
          recommendedPercentage: release.reviews.length > 0
            ? ((release.reviews.filter(r => r.is_recommended).length / 
                release.reviews.length) * 100).toFixed(1)
            : 'N/A'
        }));

        // Separate reviewed and unreviewed releases
        const reviewed = processedData.filter(r => r.reviews.length > 0);
        const unreviewed = processedData.filter(r => r.reviews.length === 0);
        
        setWeeklyData({ all: processedData, reviewed, unreviewed });
      } catch (error) {
        console.error('Error fetching weekly data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (releaseWeek && canViewLatest) {
      fetchWeeklyData();
    }
  }, [releaseWeek, canViewLatest]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-gray-400">Loading weekly summary...</p>
      </div>
    );
  }

  if (!weeklyData.all?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No releases found for this week.</p>
      </div>
    );
  }

  return (
    <div className="weekly-summary space-y-6">
      <WeeklyStats data={weeklyData.all} /> 

      {weeklyData.reviewed.length > 0 && (
        <div className="reviewed-releases">
          <h3 className="text-xl font-semibold mb-4">Reviewed Releases</h3>
          
          {viewMode === 'list' ? (
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
                  {weeklyData.reviewed.map((release) => (
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
              {weeklyData.reviewed.map((release) => (
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
          )}
        </div>
      )}

      {weeklyData.unreviewed.length > 0 && (
        <div className="unreviewed-releases">
          <h3 className="text-xl font-semibold mb-4">Reviewed Releases</h3>
          
          {viewMode === 'grid' ? (
            <div className="releases-grid">
              {weeklyData.unreviewed.map((release) => (
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
          ) : (
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
                  {weeklyData.unreviewed.map((release) => (
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
          )}
        </div>
      )}
    </div>
  );
}