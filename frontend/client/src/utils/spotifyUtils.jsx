// utils/spotifyUtils.js

/**
 * Get client credentials access token for non-user-specific API calls
 * @returns {Promise<string>} Access token
 */
export const getSpotifyAccessTokenClient = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/spAccessTokenClient");
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error fetching client access token:', error);
      throw new Error('Failed to get Spotify access token');
    }
  };
  
/**
 * Get user-level credentials access token for user-specific API calls
 * @returns {Promise<string>} Access token
 */
export const getSpotifyAccessTokenUser = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/spAccessTokenUser");
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error fetching client access token:', error);
      throw new Error('Failed to get Spotify access token');
    }
  };
  
  /**
   * Get album information using client credentials
   * @param {string} albumId - Spotify album ID
   * @returns {Promise<Object>} Album information
   */
  export const getReleaseInfo = async (albumId) => {
    const accessToken = await getSpotifyAccessTokenClient();
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch album info');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching album info:', error);
      throw error;
    }
  };
  
  /**
   * Get artist information using client credentials
   * @param {string} artistId - Spotify artist ID
   * @returns {Promise<Object>} Artist information
   */
  export const getArtistInfo = async (artistId) => {
    const accessToken = await getSpotifyAccessTokenClient();
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch artist info');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching artist info:', error);
      throw error;
    }
  };
   
  // User-specific operations
  
  /**
   * Check if a playlist exists for a specific user 
   * @param {string} playlistName - Playlist name
   * @returns {Promise<boolean>} Whether playlist exists
   */
    export const checkPlaylistExists = async (playlistName) => {
        const userId = '129804046';
        const accessToken = await getSpotifyAccessTokenClient();
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/users/${userId}/playlists`,
                {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                }
                );

            if (!response.ok) {
                throw new Error('Failed to fetch playlists');
                }

            const data = await response.json(); 
            const playlistExists = data.items.some((playlist) => playlist.name.toLowerCase() === playlistName.toLowerCase()); 
            const playlistUrl = playlistExists ? data.items.find((p) => p.name.toLowerCase() === playlistName.toLowerCase()).external_urls.spotify : ''; 
            
            return { playlistExists, playlistUrl };
            }
        catch (error) {
            console.error('Error fetching playlists:', error);
            throw error;
        }
    };
 