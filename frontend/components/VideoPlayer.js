import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VideoPlayer.css';

function VideoPlayer({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchVideo();
    fetchRecommendations();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const response = await axios.get(`${API_URL}/videos/${id}`);
      setVideo(response.data.video);
    } catch (err) {
      console.error('Error fetching video:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`${API_URL}/videos/${id}/recommendations`);
      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  const generateSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const response = await axios.post(`${API_URL}/videos/${id}/summarize`);
      setSummary(response.data.summary);
    } catch (err) {
      console.error('Error generating summary:', err);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // You can add API call here to save like to backend
  };

  if (isLoading) {
    return <div className="loading">Loading video...</div>;
  }

  if (!video) {
    return <div className="error">Video not found</div>;
  }

  return (
    <div className="video-player-page">
      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Feed
      </button>

      <div className="player-container">
        <div className="video-section">
          <div className="video-wrapper">
            <video
              src={video.url}
              controls
              autoPlay
              className="video-element"
              poster={video.thumbnail}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="video-details">
            <h1>{video.title}</h1>
            <div className="video-meta">
              <span className="category-badge">{video.category}</span>
              <span className="views">👁 {video.views} views</span>
              <span className="duration">⏱ {video.duration}</span>
            </div>
            <p className="description">{video.description}</p>

            <div className="action-buttons">
              <button 
                onClick={handleLike} 
                className={`action-btn ${liked ? 'liked' : ''}`}
              >
                {liked ? '❤️' : '🤍'} {liked ? 'Liked' : 'Like'}
              </button>
              <button onClick={generateSummary} className="action-btn" disabled={isLoadingSummary}>
                ✨ {isLoadingSummary ? 'Generating...' : 'AI Summary'}
              </button>
            </div>

            {summary && (
              <div className="ai-summary">
                <h3>🤖 AI-Generated Summary</h3>
                <p>{summary}</p>
              </div>
            )}
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="recommendations">
            <h3>Watch Next</h3>
            <div className="recommendations-list">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => navigate(`/video/${rec.id}`)}
                  className="recommendation-card"
                >
                  <img src={rec.thumbnail} alt={rec.title} />
                  <div className="rec-info">
                    <h4>{rec.title}</h4>
                    <p>{rec.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer;