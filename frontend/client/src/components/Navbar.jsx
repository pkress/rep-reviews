import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Library, BarChart2, Music } from 'lucide-react';
import { useViewMode } from '../context/ViewModeContext';

const Navbar = () => {
  const location = useLocation();
  const { viewMode, setViewMode } = useViewMode();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: Music },
    { path: '/all-releases', label: 'All Releases', icon: Library },
    { path: '/reports', label: 'Reports', icon: BarChart2 },
    { path: '/account', label: 'Account', icon: User }
  ];

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'grid' ? 'list' : 'grid'));
  };

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <h1>Rep-Reviews</h1>
        </Link>

        <nav>
          <ul className="nav-list">
            {navItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <Link to={path} className={isActive(path)}>
                  <Icon className="nav-icon" />
                  <span className="nav-label">{label}</span>
                </Link>
              </li>
            ))}
            <li>
              <button onClick={toggleViewMode} className="nav-link">
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;