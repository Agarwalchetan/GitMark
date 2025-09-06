import express from 'express';
import { ReadmeService } from '../services/readme.js';
import { GitHubService } from '../services/github.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Generate README for a repository
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { owner, repo, sections, customInstructions } = req.body;
    
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Repository owner and name are required' });
    }

    // Gather repository information
    const repositoryData = await GitHubService.gatherRepositoryData(
      req.session.githubToken,
      owner,
      repo
    );
    
    // Generate README content
    const readmeContent = await ReadmeService.generateReadme(
      repositoryData,
      sections,
      customInstructions
    );
    
    res.json({ content: readmeContent });
  } catch (error) {
    console.error('README generation error:', error.message);
    
    if (error.message.includes('API key')) {
      return res.status(500).json({ error: 'AI service configuration error' });
    }
    
    res.status(500).json({ error: 'Failed to generate README' });
  }
});

// Save README to repository
router.post('/save', requireAuth, async (req, res) => {
  try {
    const { owner, repo, content, message = 'Generated README.md' } = req.body;
    
    if (!owner || !repo || !content) {
      return res.status(400).json({ error: 'Repository details and content are required' });
    }

    const result = await GitHubService.saveReadmeFile(
      req.session.githubToken,
      owner,
      repo,
      content,
      message
    );
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('README save error:', error.message);
    
    if (error.status === 403) {
      return res.status(403).json({ error: 'Insufficient permissions to write to repository' });
    }
    
    res.status(500).json({ error: 'Failed to save README' });
  }
});

export default router;