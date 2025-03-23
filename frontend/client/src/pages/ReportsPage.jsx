import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import PlaylistManager from '../components/PlaylistManager';
import { useSession } from '../context/SessionProvider';
import { dateFormatters } from '../utils/dateUtils';
import { Music, ThumbsUp, Star, Award, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const WeeklySummaryCard = ({ title, icon: Icon, value, description, className = '' }) => {
  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      <div className="flex items-center mb-3">
        <div className="bg-blue-600/20 p-2 rounded-full mr-3">
          <Icon className="text-blue-400" size={24} />
        </div>
        <h3 className="font-semibold text-gray-200">{title}</h3>
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      {description && <p className="text-sm text-gray-400">{description}</p>}
    </div>
  );
};

const AlbumCard = ({ album, showScore = true }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md transition hover:shadow-lg hover:translate-y-[-2px]">
      <img 
        src={album.release_cover_url} 
        alt={album.release_name} 
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-white line-clamp-1" title={album.release_name}>
          {album.release_name}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-1" title={album.release_artist_names}>
          {album.release_artist_names}
        </p>
        
        {showScore && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center">
              <Star className="text-yellow-400 mr-1" size={16} />
              <span>{album.averageScore !== 'N/A' ? album.averageScore : '—'}</span>
            </div>
            <div className="flex items-center">
              <ThumbsUp className="text-green-400 mr-1" size={16} />
              <span>{album.recommendedPercentage !== 'N/A' ? `${album.recommendedPercentage}%` : '—'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WeekSelector = ({ weeks, selectedWeek, onChange }) => {
  return (
    <div className="flex items-center mb-6 bg-gray-800 p-2 rounded-lg">
      <Calendar className="text-gray-400 mr-2 ml-2" size={20} />
      <select
        value={selectedWeek || ''}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-700 text-white rounded-lg px-4 py-2 flex-grow"
      >
        {weeks.map((week) => (
          <option key={week.release_week} value={week.release_week}>
            Week ending on Friday, {dateFormatters.toISOString(new Date(week.release_week))}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function ReportsPage() {
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [canViewLatestWeek, setCanViewLatestWeek] = useState(false);
  const [weeklyReleases, setWeeklyReleases] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalReleases: 0,
    totalReviews: 0,
    averageScore: 'N/A',
    recommendPercentage: 'N/A',
    topRatedAlbums: [],
    mostRecommendedAlbums: [],
    leastRecommendedAlbums: [],
    submittedReleases: [],
    reviewedReleases: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = useSession();

  // Fetch available weeks
  useEffect(() => {
    async function fetchWeeks() {
      try {
        const { data, error } = await supabase
          .from('release_submissions')
          .select('release_week')
          .order('release_week', { ascending: false });

        if (error) throw error;

        // Deduplicate weeks and ensure correct UTC date handling
        const uniqueWeeks = data.filter(
          (week, index, self) => {
            // Add time component for UTC handling 
            week.release_week = week.release_week + 'T00:00:00Z';
            return index === self.findIndex((t) => t.release_week === week.release_week);
          }
        );

        setAvailableWeeks(uniqueWeeks);
        if (uniqueWeeks.length > 0) {
          setSelectedWeek(uniqueWeeks[0].release_week);
        }
      } catch (err) {
        console.error("Error fetching weeks:", err);
        setError("Failed to load available weeks");
      }
    }

    fetchWeeks();
  }, []);

  // Check permissions and fetch releases when week changes
  useEffect(() => {
    async function checkPermissionAndFetchReleases() {
      if (!session || !selectedWeek) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Check if user has reviewed for selected week
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select(`
            review_id, 
            releases!inner (
              release_week
            )
          `)
          .eq('releases.release_week', dateFormatters.toISOString(new Date(selectedWeek)))
          .eq('user_id', session.user.id);

        const hasPermission = !reviewError && reviewData && reviewData.length > 0;
        const isNotLatestWeek = availableWeeks.length > 0 && 
          dateFormatters.toISOString(new Date(selectedWeek)) !== 
          dateFormatters.toISOString(new Date(availableWeeks[0]?.release_week));

        setCanViewLatestWeek(hasPermission || isNotLatestWeek);

        // Fetch releases if user has permission
        if (hasPermission || isNotLatestWeek) {
          // Get all releases for the week
          const { data: releases, error: releasesError } = await supabase
            .from('releases')
            .select(`
              release_id, release_id_int, release_name, release_artist_names,
              release_date, release_cover_url, spotify_id,
              reviews (
                review_score, is_recommended
              ),
              release_submissions (
                user_id
              )
            `)
            .eq('release_week', dateFormatters.toISOString(new Date(selectedWeek)));

          if (releasesError) throw releasesError;

          if (!releases || releases.length === 0) {
            setWeeklyStats({
              totalReleases: 0,
              totalReviews: 0,
              averageScore: 'N/A',
              recommendPercentage: 'N/A',
              topRatedAlbums: [],
              mostRecommendedAlbums: [],
              leastRecommendedAlbums: [],
              submittedReleases: [],
              reviewedReleases: []
            });
            setWeeklyReleases([]);
            return;
          }

          // Process release data
          const processedReleases = releases.map(release => ({
            ...release,
            averageScore: release.reviews.length > 0
              ? (release.reviews.reduce((sum, r) => sum + r.review_score, 0) / 
                 release.reviews.length).toFixed(1)
              : 'N/A',
            recommendedPercentage: release.reviews.length > 0
              ? ((release.reviews.filter(r => r.is_recommended).length / 
                  release.reviews.length) * 100).toFixed(0)
              : 'N/A'
          }));

          // Calculate weekly stats
          const reviewedReleases = processedReleases.filter(r => r.reviews.length > 0);
          const totalReleases = processedReleases.length;
          const totalReviews = processedReleases.reduce((sum, r) => sum + r.reviews.length, 0);
          
          // Calculate overall average score and recommend percentage
          let overallAverageScore = 'N/A';
          let overallRecommendPercentage = 'N/A';
          
          if (totalReviews > 0) {
            let totalScoreSum = 0;
            let totalRecommendedCount = 0;
            
            reviewedReleases.forEach(release => {
              release.reviews.forEach(review => {
                totalScoreSum += review.review_score;
                if (review.is_recommended) totalRecommendedCount++;
              });
            });
            
            overallAverageScore = (totalScoreSum / totalReviews).toFixed(1);
            overallRecommendPercentage = ((totalRecommendedCount / totalReviews) * 100).toFixed(0);
          }

          // Get top rated albums (up to 3)
          const sortedByScore = [...reviewedReleases]
            .filter(r => r.averageScore !== 'N/A')
            .sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore));
          
          const topRatedAlbums = sortedByScore.slice(0, 3);

          // Get most and least recommended albums
          const sortedByRecommend = [...reviewedReleases]
            .filter(r => r.recommendedPercentage !== 'N/A')
            .sort((a, b) => parseFloat(b.recommendedPercentage) - parseFloat(a.recommendedPercentage));
          
          const mostRecommendedAlbums = sortedByRecommend.slice(0, 3);
          const leastRecommendedAlbums = [...sortedByRecommend].reverse().slice(0, 3);

          setWeeklyStats({
            totalReleases,
            totalReviews,
            averageScore: overallAverageScore,
            recommendPercentage: overallRecommendPercentage,
            topRatedAlbums,
            mostRecommendedAlbums,
            leastRecommendedAlbums,
            submittedReleases: processedReleases,
            reviewedReleases
          });
          
          setWeeklyReleases(releases);
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError("Failed to load report data for the selected week");
      } finally {
        setLoading(false);
      }
    }

    checkPermissionAndFetchReleases();
  }, [session, selectedWeek, availableWeeks]);

  if (loading && availableWeeks.length === 0) {
    return <LoadingSpinner message="Loading weekly reports..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6">
          <p className="font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (availableWeeks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Weekly Reports</h1>
          <p className="text-gray-400">No reports are available yet. Submit albums to get started!</p>
        </div>
      </div>
    );
  }

  const {
    totalReleases,
    totalReviews,
    averageScore,
    recommendPercentage,
    topRatedAlbums,
    mostRecommendedAlbums,
    submittedReleases,
    reviewedReleases
  } = weeklyStats;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Weekly Reports</h1>
      
      {/* Week Selection */}
      <WeekSelector 
        weeks={availableWeeks} 
        selectedWeek={selectedWeek} 
        onChange={setSelectedWeek} 
      />
      
      {!canViewLatestWeek && selectedWeek === availableWeeks[0]?.release_week ? (
        <div className="bg-blue-900/30 border border-blue-600 text-blue-200 px-4 py-3 rounded-lg mb-6">
          <p>You'll be able to see the weekly report after you've submitted your review for this week.</p>
        </div>
      ) : loading ? (
        <LoadingSpinner message="Loading report data..." />
      ) : (
        <div className="space-y-8">
          {/* Playlist Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Playlist</h2>
            <PlaylistManager
              playlistName={`Weekly Release - ${dateFormatters.toISOString(new Date(selectedWeek))}`}
              releaseData={weeklyReleases}
            />
          </div>

          {/* Stats Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Weekly Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <WeeklySummaryCard 
                title="Total Releases" 
                icon={Music}
                value={totalReleases} 
                description="Albums submitted this week"
              />
              <WeeklySummaryCard 
                title="Total Reviews" 
                icon={Star}
                value={totalReviews} 
                description="Reviews completed"
              />
              <WeeklySummaryCard 
                title="Average Score" 
                icon={Award}
                value={averageScore === 'N/A' ? '—' : averageScore} 
                description="Out of 10"
              />
              <WeeklySummaryCard 
                title="Recommended" 
                icon={ThumbsUp}
                value={recommendPercentage === 'N/A' ? '—' : `${recommendPercentage}%`} 
                description="Of all reviews"
              />
            </div>
          </div>

          {/* Top Albums */}
          {topRatedAlbums.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Top Rated Albums</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topRatedAlbums.map(album => (
                  <AlbumCard key={album.release_id} album={album} />
                ))}
              </div>
            </div>
          )}

          {/* Most Recommended */}
          {mostRecommendedAlbums.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Most Recommended</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mostRecommendedAlbums.map(album => (
                  <AlbumCard key={album.release_id} album={album} />
                ))}
              </div>
            </div>
          )}
          
          {/* All Submissions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">All Submissions ({submittedReleases.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {submittedReleases.map(album => (
                <AlbumCard key={album.release_id} album={album} showScore={false} />
              ))}
            </div>
          </div>

          {/* Reviewed Albums */}
          {reviewedReleases.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Reviewed Albums ({reviewedReleases.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {reviewedReleases.map(album => (
                  <AlbumCard key={album.release_id} album={album} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}