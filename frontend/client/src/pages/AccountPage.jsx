// pages/AccountPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Avatar from '../components/Avatar';
import EmailPreferences from '../components/EmailPreferences';
import { useSession } from '../context/SessionProvider';

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatar_url, setAvatarUrl] = useState('');
  const [full_name, setFullName] = useState('');
  const [lastfm_username, setLastfmUsername] = useState('');
  const [spotify_username, setSpotifyUsername] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  const session = useSession();    

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      const { user } = session;

      let { data, error } = await supabase
        .from('profiles')
        .select(`
          username, 
          avatar_url, 
          full_name, 
          lastfm_username,
          spotify_username,
          email_notifications
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
        setFullName(data.full_name);
        setLastfmUsername(data.lastfm_username || '');
        setSpotifyUsername(data.spotify_username || '');
        setEmailNotifications(data.email_notifications !== false); // Default to true if not set
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(event) {
    event.preventDefault();

    try {
      setLoading(true);
      const { user } = session;

      const updates = {
        id: user.id,
        username,
        avatar_url,
        full_name,
        lastfm_username: lastfm_username || null,
        spotify_username: spotify_username || null,
        email_notifications: emailNotifications,
        updated_at: new Date(),
      };

      let { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      {/* Email Notification Preferences */}
      <EmailPreferences 
        emailNotifications={emailNotifications} 
        userId={session.user.id}
        onUpdate={(newValue) => setEmailNotifications(newValue)}
      />
      
      <form onSubmit={updateProfile} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-gray-400 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="text"
                className="bg-gray-800 text-gray-300"
                value={session.user.email}
                disabled
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2" htmlFor="username">
                Username*
              </label>
              <input
                id="username"
                type="text"
                className="bg-gray-800"
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2" htmlFor="full_name">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                className="bg-gray-800"
                value={full_name || ''}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2" htmlFor="lastfm">
                Last.fm Username
              </label>
              <input
                id="lastfm"
                type="text"
                className="bg-gray-800"
                value={lastfm_username || ''}
                onChange={(e) => setLastfmUsername(e.target.value)}
                placeholder="Your Last.fm username"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2" htmlFor="spotify">
                Spotify Username
              </label>
              <input
                id="spotify"
                type="text"
                className="bg-gray-800"
                value={spotify_username || ''}
                onChange={(e) => setSpotifyUsername(e.target.value)}
                placeholder="Your Spotify username"
              />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <Avatar
              url={avatar_url}
              size={150}
              onUpload={(event, url) => {
                setAvatarUrl(url);
                updateProfile(event);
              }}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Update Profile'}
          </button>

          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            type="button"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </form>
    </div>
  );
}