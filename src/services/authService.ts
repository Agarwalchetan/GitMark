const API_BASE_URL = 'http://localhost:3001/api';

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