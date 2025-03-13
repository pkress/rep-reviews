# Rep Reviews

A community-driven music discovery and review platform that helps users discover, review, and share the best new music releases every week.

## Features

- Weekly album submission system
- Review assignment and scoring
- Community curation of music
- Spotify integration for playlist generation
- Weekly reports and statistics
- User profiles

## Tech Stack

- **Frontend**: React with React Router
- **Backend**: Node.js with Express
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Music Data**: Spotify API
- **Styling**: Custom CSS

## Project Structure

```
rep-reviews/
├── backend/               # Node.js/Express backend server
│   ├── server/            # Server code
│   ├── services/          # Business logic services
│   └── templates/         # Email templates
├── frontend/              # React frontend
│   ├── client/            # React app
│   │   ├── public/        # Static assets
│   │   └── src/           # Source code
│   │       ├── assets/    # Images and other assets
│   │       ├── components/# Reusable components
│   │       ├── context/   # React context providers
│   │       ├── css/       # CSS stylesheets
│   │       ├── hooks/     # Custom React hooks
│   │       ├── pages/     # Page components
│   │       └── utils/     # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account
- Spotify Developer account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/rep-reviews.git
   cd rep-reviews
   ```

2. Install dependencies:
   ```
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend/client
   npm install
   ```

3. Set up environment variables:
   - Create `.env` file in the `backend` directory:
     ```
     PORT=3001
     SPCLIENTID=your_spotify_client_id
     SPCLIENTSECRET=your_spotify_client_secret
     SPREFRESHTOKEN=your_spotify_refresh_token
     SPUSERID=your_spotify_user_id
     ```
   - Create `.env.local` file in the `frontend/client` directory:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_APP_ENV=development
     ```

4. Start the development servers:
   ```
   # Start backend server
   cd backend
   npm start
   
   # In a new terminal, start frontend server
   cd frontend/client
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Backend Deployment

1. Set up environment variables on your hosting platform
2. Deploy the Node.js backend

```bash
# Build for production
cd backend
npm run build

# Start production server
npm start
```

### Frontend Deployment

1. Build the React app for production:
```bash
cd frontend/client
npm run build
```

2. Deploy the contents of the `frontend/client/dist` directory to your web hosting service

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the backend infrastructure
- [Spotify API](https://developer.spotify.com/documentation/web-api/) for music data
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [Lucide React](https://lucide.dev/) for the beautiful icons