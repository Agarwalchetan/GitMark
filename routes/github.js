import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Get project repository stats
router.get('/project-stats', async (req, res) => {
  try {
    const repoPath = process.env.GITHUB_REPO || 'agarwalchetan/gitmark'; // Default fallback
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitMark-App'
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    console.log(`Fetching stats for repository: ${repoPath}`);
    const response = await fetch(`https://api.github.com/repos/${repoPath}`, { headers });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      // Return default stats if API fails
      return res.json({
        stars: 0,
        forks: 0,
        url: `https://github.com/${repoPath}`,
        error: 'Stats temporarily unavailable'
      });
    }

    const data = await response.json();
    
    res.json({
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      url: data.html_url || `https://github.com/${repoPath}`
    });
  } catch (error) {
    console.error('GitHub stats error:', error.message);
    // Return graceful fallback instead of 500 error
    res.json({
      stars: 0,
      forks: 0,
      url: 'https://github.com/agarwalchetan/gitmark',
      error: 'Stats temporarily unavailable'
    });
  }
});

export default router;
