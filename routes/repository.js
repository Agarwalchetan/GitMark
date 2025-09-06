import express from 'express';
import { GitHubService } from '../services/github.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user repositories
router.get('/list', requireAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 30, type = 'all' } = req.query;
    const repositories = await GitHubService.getUserRepositories(
      req.session.githubToken,
      { page: parseInt(page), per_page: parseInt(per_page), type }
    );
    
    res.json(repositories);
  } catch (error) {
    console.error('Repository list error:', error.message);
    
    if (error.status === 401) {
      return res.status(401).json({ error: 'GitHub authentication expired' });
    }
    
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Get repository details
router.get('/:owner/:repo', requireAuth, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repository = await GitHubService.getRepositoryDetails(
      req.session.githubToken,
      owner,
      repo
    );
    
    res.json(repository);
  } catch (error) {
    console.error('Repository details error:', error.message);
    
    if (error.status === 404) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    
    if (error.status === 401) {
      return res.status(401).json({ error: 'GitHub authentication expired' });
    }
    
    res.status(500).json({ error: 'Failed to fetch repository details' });
  }
});

// Get repository file structure
router.get('/:owner/:repo/structure', requireAuth, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const structure = await GitHubService.getRepositoryStructure(
      req.session.githubToken,
      owner,
      repo
    );
    
    res.json(structure);
  } catch (error) {
    console.error('Repository structure error:', error.message);
    res.status(500).json({ error: 'Failed to fetch repository structure' });
  }
});

export default router;