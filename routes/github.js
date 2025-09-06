import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Get project repository stats
router.get('/project-stats', async (req, res) => {
  try {
    const repoPath = process.env.GITHUB_REPO;
    if (!repoPath) {
      return res.status(500).json({ error: 'Repository not configured' });
    }

    const response = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitMark-App'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repository stats');
    }

    const data = await response.json();
    
    res.json({
      stars: data.stargazers_count,
      forks: data.forks_count,
      url: data.html_url
    });
  } catch (error) {
    console.error('GitHub stats error:', error.message);
    res.status(500).json({ error: 'Failed to fetch project stats' });
  }
});

export default router;