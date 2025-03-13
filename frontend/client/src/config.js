// frontend/client/src/config.js
const environment = import.meta.env.VITE_APP_ENV || 'development';

const configs = {
  development: {
    apiBaseUrl: 'http://localhost:3001',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    spotifyCallbackUrl: 'http://localhost:5173/callback',
    appName: 'Rep Reviews (Dev)'
  },
  staging: {
    apiBaseUrl: 'https://api-staging.rep-reviews.org',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    spotifyCallbackUrl: 'https://staging.rep-reviews.org/callback',
    appName: 'Rep Reviews (Staging)'
  },
  production: {
    apiBaseUrl: 'https://api.rep-reviews.org',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    spotifyCallbackUrl: 'https://rep-reviews.org/callback',
    appName: 'Rep Reviews'
  }
};

export default configs[environment];