import express from 'express';
import { GitHubService } from '../services/github.js';
import { generateRandomString } from '../utils/security.js';

const router = express.Router();

// GitHub OAuth login
router.get('/github', (req, res) => {
  try {
    const state = generateRandomString(32);
    req.session.oauthState = state;
    
    const githubAuthUrl = GitHubService.getAuthorizationUrl(state);
    res.redirect(githubAuthUrl);
  } catch (error) {
    console.error('GitHub OAuth initiation error:', error.message);
    res.status(500).json({ error: 'Failed to initiate GitHub OAuth' });
  }
});

// GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    // Verify state parameter
    if (!state || state !== req.session.oauthState) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    // Exchange code for access token
    const tokenData = await GitHubService.exchangeCodeForToken(code);
    
    if (!tokenData.access_token) {
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }

    // Get user information
    const userInfo = await GitHubService.getUserInfo(tokenData.access_token);
    
    // Store user session data (NOT the token)
    req.session.user = {
      id: userInfo.id,
      login: userInfo.login,
      name: userInfo.name,
      avatar_url: userInfo.avatar_url,
      email: userInfo.email,
      created_at: new Date().toISOString()
    };
    
    // Store token securely in session
    req.session.githubToken = tokenData.access_token;
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
    });
    
    // Clean up OAuth state
    delete req.session.oauthState;
    
    // Redirect back to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  } catch (error) {
    console.error('GitHub OAuth callback error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
  }
});

// Get current user
router.get('/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  res.json({ user: req.session.user });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    // Clear the custom session cookie
    res.clearCookie('gitmark.sid', {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;