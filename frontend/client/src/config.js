// frontend/client/src/config.js
const environment = import.meta.env.VITE_APP_ENV || 'development';

const configs = {
  development: {
    apiBaseUrl: import.meta.env.DEV_BACKEND_URL,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    spotifyCallbackUrl: import.meta.env.SP_CALLBACK_URL,
    appName: 'Rep Reviews (Dev)'
  },  
  production: {
    apiBaseUrl: import.meta.env.PROD_BACKEND_URL,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    spotifyCallbackUrl: import.meta.env.SP_CALLBACK_URL,
    appName: 'Rep Reviews'
  }
};

export default configs[environment];