import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './VideoFeed.css';

function VideoFeed({ user }) {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API_URL}/videos`);
      setVideos(response.data.videos);
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading-feed">Loading videos...</div>;
  }

  if (error) {
    return <div className="error-feed">{error}</div>;
  }

  // Get unique categories
  const categories = ['All', ...new Set(videos.map(v => v.category))];

  // Filter videos based on search and category
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="video-feed">
      <div className="feed-header">
        <h2>Discover Short Stories</h2>
        <p>Binge-worthy content in bite-sized pieces</p>
      </div>

      {/* Search Bar */}
      <div className="search-filter-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Show results count */}
      {searchTerm && (
        <p className="results-count">
          Found {filteredVideos.length} result{filteredVideos.length !== 1 ? 's' : ''}
        </p>
      )}

      <div className="video-grid">
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <Link to={`/video/${video.id}`} key={video.id} className="video-card">
              <div className="video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
                <div className="video-duration">{video.duration}</div>
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                <p className="video-category">{video.category}</p>
                <p className="video-description">{video.description}</p>
                <div className="video-stats">
                  <span>👁 {video.views} views</span>
                  <span>❤️ {video.likes}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-results">
            <p>No videos found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoFeed;