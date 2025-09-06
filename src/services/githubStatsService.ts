const API_BASE_URL = '/api';

export const githubStatsService = {
  async getProjectStats() {
    const response = await fetch(`${API_BASE_URL}/github/project-stats`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch project stats');
    }
    
    return response.json();
  }
};