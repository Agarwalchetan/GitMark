// Use the correct backend URL based on environment
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser, use current origin for production or localhost for development
    return window.location.origin === 'https://gitmark.onrender.com' 
      ? 'https://gitmark.onrender.com'
      : 'http://localhost:3001';
  }
  return 'http://localhost:3001';
};

const API_BASE_URL = `${getBackendUrl()}/api`;

export const authService = {
  async initiateGitHubAuth() {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  async handleCallback() {
    // Callback is handled by the server redirect
    return Promise.resolve();
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    
    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    return response.json();
  }
};