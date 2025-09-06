export const requireAuth = (req, res, next) => {
  if (!req.session.user || !req.session.githubToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
};