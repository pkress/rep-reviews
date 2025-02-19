import { React, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import { isDateInLastWeek, getLastFriday, getLastLastFriday, dateFormatters } from '../utils/dateUtils';
import { 
  getReleaseInfo, 
  getArtistInfo
} from '../utils/spotifyUtils';

function ReleaseSubmissionForm({ session }) {
  const { user } = session;
  const maxSubmissions = 5;
  
  const [loading, setLoading] = useState(true);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [spUrl, setSpUrl] = useState(""); 
  const [allowSubmit, setAllowSubmit] = useState(true);

  // Functions to check validity of release
  const lastFriday = getLastFriday();   
  const last_friday_iso = dateFormatters.toISOString(lastFriday);
  function checkReleaseDate(releaseInfo) { 
    if (!releaseInfo?.release_date) { 
        return false;  
    }

    return isDateInLastWeek(releaseInfo.release_date);
  }
  // Get submission count for this round
  useEffect(() => {
    async function getSubmissionCount() {
      setLoading(true);
      let { data, error } = await supabase
        .from('release_submissions')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.parse(lastFriday)).toISOString());

      if (error) {
        console.warn(error);
      } else if (data) {
        setSubmissionCount(data.length);
      }
      setLoading(false);
    }
    getSubmissionCount();
  }, [user]);

  async function submitRelease(event) {
    event.preventDefault();
    setLoading(true);
    console.log(spUrl);
    // Validate album URL
    const albumReleaseValid = spUrl.split("/")[3] === "album";
    if (!albumReleaseValid) {
      alert("Invalid submission. Must be an album link");
      setLoading(false);
      return;
    }

    let spReleaseID = spUrl.split("/")[4].split("?")[0];

    // Get release info from Spotify API
    const releaseInfo = await getReleaseInfo(spReleaseID); 

    // Check validity of release
    const releaseValid = checkReleaseDate(releaseInfo);
    if (!releaseValid) {
        alert("Invalid release date. Please check your Spotify URL and try again.");
        setLoading(false); 
        window.location.reload();
        return;
    }

    // Get release id from supabase for this submission, if it already exists
    let { data, error } = await supabase
        .from('releases')
        .select('spotify_id, release_id')
        .eq('spotify_id', spReleaseID);
      
    console.log(data);

    let release_id = null;
    if (error) {
        console.warn(error);
    } else if (data.length > 0) { 
          release_id = data[0].release_id; 
      } 

    // Check that user hasn't submitted this release already
    let { data: subData, error: subError } = await supabase
        .from('release_submissions')
        .select('release_id')
        .eq('user_id', user.id)
        .eq('release_week', last_friday_iso);
    
    // check if release_id appears in results
    let idInPrevSubs = false;
    if (subData.length > 0) {
      idInPrevSubs = subData.some(sub => sub.release_id === release_id);
    } 
      
    if (subError) {
        console.warn(subError);  
    } else if (idInPrevSubs) { 
        console.log(subData);
        alert("Invalid submission. You have already submitted this release this week."); 
        setLoading(false);
        setAllowSubmit(false); 
        window.location.reload();
        return; 
    }

    // Check submission count validity
    const subCountValid = submissionCount < maxSubmissions;
    if (!subCountValid) {
        alert("Invalid submission. Cannot submit more than " + maxSubmissions + " releases in a week.");
        setLoading(false);
        setAllowSubmit(false); 
        window.location.reload();
        return;
    }

    // If all checks pass, submit the release
    if (allowSubmit) {   
      console.log("Valid submission. Submitting.");
      // Add new release if not existing
      if (release_id === null) { 
        console.log("Adding new release to database."); 
        
        const releaseGenres = releaseInfo.genres.join(", ");
        const releaseArtistIDs = releaseInfo.artists.map(artist => artist.id);
        const releaseArtistNames = releaseInfo.artists.map(artist => artist.name).join(", ");
         
        // Fetch artist genres asynchronously
        const artistGenresPromises = releaseArtistIDs.map(id => getArtistInfo(id));
        const artistGenresData = await Promise.all(artistGenresPromises);

        // Extract genres from artist data
        const releaseArtistGenres = artistGenresData.map(artistData => {
            const genres = artistData.genres || [];
            return genres.length ? genres.join(", ") : "No genre";
        }).join('; ');

        const release = { 
            spotify_id: spReleaseID, 
            created_at: new Date(),
            release_name: releaseInfo.name,
            release_cover_url: releaseInfo.images[1].url,
            release_type: releaseInfo.album_type,
            release_date: releaseInfo.release_date,
            release_week: lastFriday,
            release_tracks: releaseInfo.total_tracks,
            release_popularity: releaseInfo.popularity,
            release_label: releaseInfo.label,
            release_genres: releaseGenres, 
            release_artist_names: releaseArtistNames,
            release_artist_ids: releaseArtistIDs, 
            release_artist_genres: releaseArtistGenres
        };

        let { error: e2 } = await supabase.from('releases').insert(release);
        if (e2) {
            console.warn(e2);
        }

        // Retrieve new release_id
        let { data: newData, error: e3 } = await supabase
            .from('releases')
            .select('spotify_id, release_id')
            .eq('spotify_id', spReleaseID);

        if (e3) {
            console.warn(e3);
        } else if (newData) {
            release_id = newData[0].release_id;
        }
      } 

      // Confirm we have release ID
      if (release_id) {
          const submission = {
              user_id: user.id,
              created_at: new Date(),
              release_id: release_id,
              release_week: lastFriday
          };

          let { error: esub } = await supabase
              .from('release_submissions')
              .insert(submission);

          if (esub) {
              console.warn(esub);
          } else {
              alert("Valid submission! Uploaded to submissions table. Await a review request.");
              // Refresh the page
              window.location.reload();
          }
      } else {
          alert("Error: Could not find or create the release ID.");
      }
    }
    setLoading(false);
  }
 
  return (
    <div className="submission-container">
      <div className="submission-status">
        <p>You have submitted {submissionCount} out of {maxSubmissions} submissions this week.</p>
      </div>
      
      <form onSubmit={submitRelease} className="submission-form">
        <div className="form-group">
          <label htmlFor="spUrl" className="form-label">Spotify Album URL</label>
          <input
            id="spUrl"
            type="text"
            required
            value={spUrl}
            onChange={(e) => setSpUrl(e.target.value)}
            className="form-input"
            placeholder="https://open.spotify.com/album/..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || submissionCount >= maxSubmissions}
          className="submission-button"
        >
          {loading ? 'Submitting...' : 'Submit Album'}
        </button>
      </form>
    </div>
  );
}

export default ReleaseSubmissionForm;