import crypto from 'crypto';

export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>\"'&]/g, '');
};

export const isValidGitHubRepo = (owner, repo) => {
  const repoRegex = /^[a-zA-Z0-9._-]+$/;
  return repoRegex.test(owner) && repoRegex.test(repo);
};