import express from 'express';
import crypto from 'crypto';
import { GitHubService } from '../services/github.js';
import { generateRandomString } from '../utils/security.js';

const router = express.Router();

// GitHub OAuth login
router.get('/github', (req, res) => {
  try {
    const state = generateRandomString(32);
    
    // Store state in a secure cookie only (no session dependency)
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
      signed: true
    });
    
    console.log('OAuth initiated with state:', state);
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
    
    // Verify state parameter using signed cookie only
    const cookieState = req.signedCookies.oauth_state;
    
    console.log('OAuth callback - Received state:', state);
    console.log('OAuth callback - Cookie state:', cookieState);
    
    if (!state) {
      return res.status(400).json({ error: 'State parameter missing' });
    }
    
    if (!cookieState || state !== cookieState) {
      console.error('State mismatch:', { 
        received: state, 
        cookieState
      });
      return res.status(400).json({ 
        error: 'Invalid state parameter',
        debug: process.env.NODE_ENV === 'development' ? {
          received: state,
          cookieState
        } : undefined
      });
    }
    
    // Clear the state cookie after successful validation
    res.clearCookie('oauth_state');
    
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
    
    // Create user data object
    const userData = {
      id: userInfo.id,
      login: userInfo.login,
      name: userInfo.name,
      avatar_url: userInfo.avatar_url,
      email: userInfo.email,
      created_at: new Date().toISOString()
    };
    
    // Create a simple encrypted token for stateless auth
    const secret = process.env.SESSION_SECRET || 'fallback-secret-key';
    const userToken = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(userData))
      .digest('hex');
    
    // Store user data in signed cookie
    res.cookie('user_data', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      signed: true
    });
    
    // Store verification token
    res.cookie('auth_token', userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      signed: true
    });
    
    console.log('User authenticated successfully:', userData.login);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?auth=success`);
  } catch (error) {
    console.error('GitHub OAuth callback error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
  }
});

// Get current user
router.get('/user', (req, res) => {
  try {
    const userData = req.signedCookies.user_data;
    const authToken = req.signedCookies.auth_token;
    
    if (!userData || !authToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Verify the auth token
    const secret = process.env.SESSION_SECRET || 'fallback-secret-key';
    const expectedToken = crypto.createHmac('sha256', secret)
      .update(userData)
      .digest('hex');
    
    if (authToken !== expectedToken) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    const user = JSON.parse(userData);
    res.json({ user });
  } catch (error) {
    console.error('User verification error:', error);
    res.status(401).json({ error: 'Authentication verification failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // Clear authentication cookies
  res.clearCookie('user_data');
  res.clearCookie('auth_token');
  res.clearCookie('gitmark.sid');
  
  res.json({ message: 'Logged out successfully' });
});

export default router;