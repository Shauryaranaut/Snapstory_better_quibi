import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import VideoPlayer from './components/VideoPlayer';
import VideoFeed from './components/VideoFeed';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <Link to="/" className="logo">
            <h1>SnapStory</h1>
          </Link>
          {user ? (
            <div className="user-info">
              <span>Welcome, {user.username}!</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              Login
            </Link>
          )}
        </header>

        <Routes>
          <Route 
            path="/" 
            element={user ? <VideoFeed user={user} /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/video/:id" 
            element={<VideoPlayer user={user} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;