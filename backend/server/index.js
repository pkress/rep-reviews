// server/index.js

// Import required packages
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const qs = require("querystring");
const crypto = require('crypto');

require('dotenv').config();

const PORT = process.env.PORT || 3001;

const app = express();
 
// Website you wish to allow to connect
app.use(cors({ 
  origin: ['https://mellifluous-dieffenbachia-df7b1a.netlify.app', 'https://repreviews.org', 'http://localhost:5173'] 
}));
app.use(express.json());

// Spotify API credentials
const spClientId = process.env.SPCLIENTID  
const spClientSecret = process.env.SPCLIENTSECRET 
const spRefreshToken = process.env.SPREFRESHTOKEN
const spUserID = process.env.SPUSERID
const auth_token = Buffer.from(spClientId + ":" + spClientSecret).toString("base64");  

// Basic welcome response
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Endpoint to get Spotify access token (User with refresh token)
app.get('/api/spAccessTokenUser',  async (req, res) => {
  console.log('Requesting access token (User)');
  console.log(new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: spRefreshToken,
    client_id: spClientId,
  }).toString());
  try {
    const authOptions = {
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization: `Basic ${auth_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: spRefreshToken,
        client_id: spClientId,
      }),
    };
    // console.log(authOptions);

    const response = await axios(authOptions);
    // console.log('Access token (user)', response.data.access_token);
    res.json({ message: response.data.access_token });
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Endpoint to get Spotify access token (Client) 
app.get("/api/spAccessTokenClient", (req, res) => {  
  const getAuth = async () => {
    try{
      //make post request to SPOTIFY API for access token, sending relavent info
      const token_url = 'https://accounts.spotify.com/api/token';
      const data = qs.stringify({'grant_type':'client_credentials'});
      console.log(token_url);
      const response = await axios.post(token_url, data, {
        headers: { 
          'Authorization': `Basic ${auth_token}`,
          'Content-Type': 'application/x-www-form-urlencoded' 
        }
      })
      // console.log(response); 
      // console.log(response.data.access_token);
      //return access token
      return response.data.access_token;
      //console.log(response.data.access_token);   
    }catch(error){
      //on fail, log the error in console
      console.log(error);
      const errormsg = "error in retrieving access token"
      return errormsg
    }
  }
  (async () => {
    sp_auth_token = await getAuth();
    // console.log("SpAcessToken: "+sp_auth_token);
    res.json({ message:sp_auth_token });
  })(); 
});
  
// Endpoint to create a playlist and add tracks
app.post('/api/create-playlist', async (req, res) => {
  // console.log('Request:', req);
  // console.log('Request body:', req.body);  

  const { accessToken, playlistName, releaseData } = req.body;

  try {
    // 1. Create a new playlist
    console.log('Trying to create playlist:', playlistName);
    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${spUserID}/playlists`,
      { name: playlistName, public: true },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log('Playlist created:', playlistResponse.data);

    const playlistId = playlistResponse.data.id;

    // 2. Get release IDs from releaseData
    const releaseUris = [];
    for (const release of releaseData) {
      releaseUris.push(release.releases.spotify_id);
    }  

    // 3. get track uris from each release
    const trackUris = [];
    for (const releaseUri of releaseUris) {
      const response = await axios.get(
        `https://api.spotify.com/v1/albums/${releaseUri}/tracks`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const tracks = response.data.items;
      for (const track of tracks) {
        trackUris.push(track.uri);
      }
    }

    // 4. Add releases to the playlist
    if (trackUris.length > 0) {
      // break up into chunks of 100
      const chunkedUris = [];
      for (let i = 0; i < trackUris.length; i += 100) {
        chunkedUris.push(trackUris.slice(i, i + 100));
      }

      for (const uris of chunkedUris) {
        const response = await axios.post( 
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          { uris },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } 
    }

    res.status(200).json({ message: 'Playlist created successfully', playlistId });
  } catch (error) {
    console.error('Error creating playlist:', error.message);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});