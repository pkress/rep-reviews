import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ReportSummary from '../components/ReportSummary';
import PlaylistManager from '../components/PlaylistManager';
import { useSession } from '../context/SessionProvider';
import { dateFormatters } from '../utils/dateUtils';

export default function ReportsPage() {
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [canViewLatestWeek, setCanViewLatestWeek] = useState(false);
  const [weeklyReleases, setWeeklyReleases] = useState([]);
  const session = useSession();

  // Fetch available weeks
  useEffect(() => {
    async function fetchWeeks() {
      const { data, error } = await supabase
        .from('release_submissions')
        .select('release_week')
        .order('release_week', { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

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
    }

    fetchWeeks();
  }, []);

  // Check permissions and fetch releases when week changes
  useEffect(() => {
    async function checkPermissionAndFetchReleases() {
      if (!session || !selectedWeek) return; 
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

      const hasPermission = !reviewError && reviewData.length > 0;
      setCanViewLatestWeek(hasPermission || dateFormatters.toISOString(new Date(selectedWeek)) !== availableWeeks[0]?.release_week);

      // Fetch releases if user has permission
      if (hasPermission || selectedWeek !== availableWeeks[0]?.release_week) {
        const { data: releases, error: releasesError } = await supabase
          .from('releases')
          .select('spotify_id')
          .eq('release_week', dateFormatters.toISOString(new Date(selectedWeek)));

        if (!releasesError) {
          setWeeklyReleases(releases);
        }
      }
    }

    checkPermissionAndFetchReleases();
  }, [session, selectedWeek, availableWeeks]);

  if (availableWeeks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">Loading weekly reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Weekly Reports</h1>
        
        {/* Week Selection */}
        <div className="mb-6">
          <label htmlFor="week-select" className="block text-sm font-medium text-gray-300 mb-2">
            Select Week:
          </label>
          <select
            id="week-select"
            value={selectedWeek || ''}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full max-w-xs"
          >
            {availableWeeks.map((week) => (
              <option key={week.release_week} value={week.release_week}>
                {(() => {
                  const date = dateFormatters.toISOString(new Date(week.release_week));
                  return date;
                })()}
              </option>
            ))}
          </select>
        </div>

        {/* Playlist Section */}
        {(canViewLatestWeek || selectedWeek !== availableWeeks[0]?.release_week) && (
          <PlaylistManager
            playlistName={`Weekly Release - ${dateFormatters.toISOString(new Date(selectedWeek))}`}
            releaseData={weeklyReleases}
            className="mb-6 p-4 bg-gray-800 rounded-lg"
          />
        )}
      </div>

      {/* Report Summary */}
      {selectedWeek && (
        <ReportSummary
          releaseWeek={selectedWeek}
          canViewLatest={canViewLatestWeek || selectedWeek !== availableWeeks[0]?.release_week}
        />
      )}
    </div>
  );
}