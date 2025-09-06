import crypto from 'crypto';

export const requireAuth = (req, res, next) => {
  try {
    const userData = req.signedCookies.user_data;
    const authToken = req.signedCookies.auth_token;
    
    if (!userData || !authToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify the auth token
    const secret = process.env.SESSION_SECRET || 'fallback-secret-key';
    const expectedToken = crypto.createHmac('sha256', secret)
      .update(userData)
      .digest('hex');
    
    if (authToken !== expectedToken) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    // Parse user data and attach to request
    req.user = JSON.parse(userData);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication verification failed' });
  }
};