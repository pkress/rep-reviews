import React, { useState, useEffect } from 'react';
import { getSpotifyAccessTokenUser, checkPlaylistExists } from '../utils/spotifyUtils';
import axios from 'axios';

const PlaylistManager = ({ 
  playlistName, 
  releaseData,
  className = '' // Allow custom styling from parent
}) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializePlaylist = async () => {
      if (!playlistName || !releaseData) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Format the playlist name to use ISO date without timezone
        const dateStr = playlistName.split(' - ')[1];
        const formattedDate = new Date(dateStr).toISOString().split('T')[0];
        const formattedPlaylistName = `Weekly Release - ${formattedDate}`;

        // Check if playlist already exists
        const { playlistExists, playlistUrl } = await checkPlaylistExists(formattedPlaylistName);
        
        if (playlistExists) {
          console.log('Playlist already exists:', playlistUrl);
          setPlaylistUrl(playlistUrl);
        } else if (releaseData.length > 0) {
          console.log('Creating new playlist:', formattedPlaylistName);
          await createPlaylist(formattedPlaylistName);
        }
      } catch (err) {
        console.error('Error initializing playlist:', err);
        setError('Failed to initialize playlist');
      } finally {
        setLoading(false);
      }
    };

    initializePlaylist();
  }, [playlistName, releaseData]);

  const createPlaylist = async (formattedPlaylistName) => {
    setLoading(true);
    setError(null);
    try {
      // Double-check the playlist doesn't exist before creating
      const { playlistExists, playlistUrl: existingUrl } = await checkPlaylistExists(formattedPlaylistName);
      if (playlistExists) {
        setPlaylistUrl(existingUrl);
        return;
      }

      // Format release data
      const formattedReleaseData = releaseData.map(release => ({
        releases: { spotify_id: release.spotify_id }
      }));

      // Get access token and create playlist
      const accessToken = await getSpotifyAccessTokenUser();
      const response = await axios.post('http://localhost:3001/create-playlist', {
        accessToken,
        playlistName: formattedPlaylistName,
        releaseData: formattedReleaseData,
      });

      if (response.status === 200) {
        const newPlaylistUrl = `https://open.spotify.com/playlist/${response.data.playlistId}`;
        setPlaylistUrl(newPlaylistUrl);
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`playlist-manager ${className}`}>
      <h2 className="text-lg font-semibold mb-2">Weekly Playlist</h2>
      {loading ? (
        <p className="text-gray-400">Generating playlist...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : playlistUrl ? (
        <div className="flex items-center gap-2">
          <a
            href={playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Open in Spotify
          </a>
          {/* Future extension point for additional playlist actions */}
        </div>
      ) : (
        <p className="text-gray-400">No playlist available</p>
      )}
    </div>
  );
};

export default PlaylistManager;