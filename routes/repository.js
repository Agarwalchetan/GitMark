import express from 'express';
import { GitHubService } from '../services/github.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user repositories
router.get('/list', requireAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 30, type = 'all' } = req.query;
    
    // Since we don't store GitHub tokens, fetch public repositories for the authenticated user
    const repositories = await GitHubService.getUserPublicRepositories(
      req.user.login,
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

// PUBLIC REPOSITORY ROUTES (no authentication required)

// Get public repository details
router.get('/public/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repository = await GitHubService.getPublicRepositoryDetails(owner, repo);
    
    res.json(repository);
  } catch (error) {
    console.error('Public repository details error:', error.message);
    
    if (error.status === 404) {
      return res.status(404).json({ error: 'Repository not found or is private' });
    }
    
    res.status(500).json({ error: 'Failed to fetch repository details' });
  }
});

// Get public repository structure
router.get('/public/:owner/:repo/structure', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const structure = await GitHubService.getPublicRepositoryStructure(owner, repo);
    
    res.json(structure);
  } catch (error) {
    console.error('Public repository structure error:', error.message);
    res.status(500).json({ error: 'Failed to fetch repository structure' });
  }
});

// Get complete public repository data for README generation
router.get('/public/:owner/:repo/data', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repositoryData = await GitHubService.gatherPublicRepositoryData(owner, repo);
    
    res.json(repositoryData);
  } catch (error) {
    console.error('Public repository data error:', error.message);
    
    if (error.status === 404) {
      return res.status(404).json({ error: 'Repository not found or is private' });
    }
    
    res.status(500).json({ error: 'Failed to fetch repository data' });
  }
});

export default router;