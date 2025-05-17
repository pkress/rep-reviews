import React from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';
import { Music, Headphones, ListMusic } from 'lucide-react';

const HomePage = () => {
  const session = useSession();
  
  return (
    <div className="bg-gradient">
      <div className="container">
        {/* Hero Section */}
        <div className="home-hero">
          <h1>Rep Reviews</h1>
          <p>Your weekly music discovery hub.</p>
          <p>Submit releases, review your assignment, and build a better reviewing community.</p>
          
          {!session && (
            <div className="home-cta">
              <Link to="/auth">Get Started</Link>
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="container">
          {session ? (
            <div className="text-center" style={{marginBottom: '4rem'}}>
              <h2 className="text-xl font-semibold" style={{marginBottom: '1.5rem'}}>Welcome back!</h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
                <Link to="/dashboard" className="btn-primary">
                  <Music className="btn-icon" size={20} />
                  Go to Dashboard
                </Link>
                <Link to="/all-releases" className="btn-secondary">
                  <ListMusic className="btn-icon" size={20} />
                  Browse Releases
                </Link>
              </div>
            </div>
          ) : (
            <div className="home-features">
              <div className="feature-card">
                <div className="feature-icon blue">
                  <Music className="text-blue-400" size={24} />
                </div>
                <h2 className="feature-title">Submit Releases</h2>
                <p className="feature-desc">
                  Share new albums and EPs you discover each week with the community.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon indigo">
                  <Headphones className="text-indigo-400" size={24} />
                </div>
                <h2 className="feature-title">Review Music</h2>
                <p className="feature-desc">
                  Get assigned new music to review and rate each week from community submissions.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon purple">
                  <ListMusic className="text-purple-400" size={24} />
                </div>
                <h2 className="feature-title">Discover Playlists</h2>
                <p className="feature-desc">
                  Access auto-generated Spotify playlists of all weekly submissions.
                </p>
              </div>
            </div>
          )}
          
          {/* How It Works Section */}
          <div className="how-it-works">
            <h2>How It Works</h2>
            
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-line"></div>
                <h3 className="step-title">Fri-Mon: Submit Releases</h3>
                <p className="step-desc">Submit up to 5 releases from the previous week</p>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-line"></div>
                <h3 className="step-title">Tue-Thu: Complete Reviews</h3>
                <p className="step-desc">Releases are assigned to the community to review</p>
              </div> 
              
              <div className="step">
                <div className="step-number">3</div>
                <h3 className="step-title"> Enjoy the Fruits of your Labor!</h3>
                <p className="step-desc">Find great new music and browse published reviews</p>
              </div>
            </div>
            
            <div style={{marginTop: '2.5rem', textAlign: 'center'}}>
              <Link to="/all-releases" className="text-blue-400 hover:text-blue-300" style={{display: 'inline-flex', alignItems: 'center'}}>
                Browse the latest releases <span style={{marginLeft: '0.5rem'}}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;