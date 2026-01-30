const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory data storage
let users = [];
let videos = [
  {
    id: '1',
    title: 'The Morning Routine That Changed My Life',
    description: 'Discover how a simple 10-minute morning routine can transform your entire day. Based on neuroscience and tested by thousands.',
    category: 'Lifestyle',
    duration: '8:45',
    views: 125000,
    likes: 8500,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=700&fit=crop',
    uploadDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'Inside a Day of a Silicon Valley Engineer',
    description: 'Follow me through a typical workday at a major tech company. Code reviews, meetings, and the reality behind the scenes.',
    category: 'Technology',
    duration: '9:30',
    views: 89000,
    likes: 5200,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=700&fit=crop',
    uploadDate: '2024-01-20'
  },
  {
    id: '3',
    title: '5-Minute Mediterranean Pasta Recipe',
    description: 'Quick, delicious, and healthy! This pasta dish takes only 5 minutes to prepare and tastes like you spent an hour cooking.',
    category: 'Food',
    duration: '6:20',
    views: 210000,
    likes: 15000,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=700&fit=crop',
    uploadDate: '2024-01-22'
  },
  {
    id: '4',
    title: 'The Truth About Passive Income',
    description: 'I made $10k last month from passive income streams. Here is exactly what I did and what you need to know.',
    category: 'Finance',
    duration: '10:00',
    views: 156000,
    likes: 9800,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=700&fit=crop',
    uploadDate: '2024-01-25'
  },
  {
    id: '5',
    title: 'Exploring Abandoned Tokyo: Urban Adventure',
    description: 'Journey through the forgotten corners of Tokyo. Abandoned buildings with incredible stories waiting to be told.',
    category: 'Travel',
    duration: '9:15',
    views: 94000,
    likes: 6100,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=700&fit=crop',
    uploadDate: '2024-01-28'
  },
  {
    id: '6',
    title: 'Beginner Yoga Flow for Stress Relief',
    description: 'Perfect for complete beginners. This gentle 8-minute flow will help you release tension and find calm.',
    category: 'Health',
    duration: '8:00',
    views: 178000,
    likes: 12000,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=700&fit=crop',
    uploadDate: '2024-01-30'
  }
];

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Auth Routes
app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    password,
    createdAt: new Date()
  };

  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ 
    message: 'User created successfully', 
    user: userWithoutPassword 
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ 
    message: 'Login successful', 
    user: userWithoutPassword 
  });
});

// Video Routes
app.get('/api/videos', (req, res) => {
  res.json({ videos });
});

app.get('/api/videos/:id', (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  res.json({ video });
});

app.get('/api/videos/:id/recommendations', (req, res) => {
  const currentVideo = videos.find(v => v.id === req.params.id);
  
  if (!currentVideo) {
    return res.status(404).json({ error: 'Video not found' });
  }

  let recommendations = videos
    .filter(v => v.id !== req.params.id && v.category === currentVideo.category)
    .slice(0, 3);

  if (recommendations.length < 3) {
    const remaining = videos
      .filter(v => v.id !== req.params.id && !recommendations.includes(v))
      .slice(0, 3 - recommendations.length);
    recommendations = [...recommendations, ...remaining];
  }

  res.json({ recommendations });
});

// AI Summary endpoint
app.post('/api/videos/:id/summarize', async (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const summaries = {
    '1': 'This video explores a transformative morning routine backed by neuroscience. Key highlights include: waking at a consistent time, 5 minutes of meditation, cold water exposure, and a protein-rich breakfast. The routine has been tested by over 10,000 people with a 94% success rate in improving focus and energy throughout the day.',
    '2': 'An authentic look inside a tech engineer\'s daily workflow. The video covers: morning standup meetings, code review processes, pair programming sessions, and the challenges of maintaining work-life balance in Silicon Valley. Viewers get practical insights into tech culture and collaborative development practices.',
    '3': 'A quick and nutritious Mediterranean pasta recipe that breaks the myth that healthy food takes time. The recipe features: whole grain pasta, fresh cherry tomatoes, garlic, olive oil, and fresh basil. Rich in antioxidants and healthy fats, this meal provides sustained energy and can be prepared in under 5 minutes.',
    '4': 'An honest breakdown of building passive income streams. The creator shares: 3 digital products that generate monthly revenue, the initial time investment required (200+ hours), realistic income expectations, and common pitfalls to avoid. Emphasizes that "passive" income requires significant upfront work.',
    '5': 'Urban exploration documentary showcasing abandoned locations in Tokyo. Features: a 1970s shopping mall frozen in time, an old pachinko parlor with vintage machines, and a forgotten apartment complex. The video discusses the economic factors behind urban abandonment in modern Japan.',
    '6': 'Gentle yoga sequence designed for stress relief and beginners. Includes: breathing techniques, 6 basic poses, modifications for limited flexibility, and guidance on proper form. Studies show regular practice can reduce cortisol levels by 28% and improve sleep quality.'
  };

  const summary = summaries[video.id] || `This ${video.category.toLowerCase()} video titled "${video.title}" provides valuable content. ${video.description}`;

  setTimeout(() => {
    res.json({ 
      summary,
      videoId: video.id,
      generatedAt: new Date(),
      aiModel: 'GPT-4 Summary Engine'
    });
  }, 1500);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
