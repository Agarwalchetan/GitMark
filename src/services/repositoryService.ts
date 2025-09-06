const API_BASE_URL = '/api';

export const repositoryService = {
  async getUserRepositories(page = 1, perPage = 30, type = 'all') {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      type
    });
    
    const response = await fetch(`${API_BASE_URL}/repository/list?${params}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }
    
    return response.json();
  },

  async getRepositoryDetails(owner: string, repo: string) {
    const response = await fetch(`${API_BASE_URL}/repository/${owner}/${repo}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch repository details');
    }
    
    return response.json();
  },

  // Public repository methods (no authentication required)
  async getPublicRepositoryDetails(owner: string, repo: string) {
    const response = await fetch(`${API_BASE_URL}/repository/public/${owner}/${repo}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found or is private');
      }
      throw new Error('Failed to fetch repository details');
    }
    
    return response.json();
  },

  async getPublicRepositoryData(owner: string, repo: string) {
    const response = await fetch(`${API_BASE_URL}/repository/public/${owner}/${repo}/data`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found or is private');
      }
      throw new Error('Failed to fetch repository data');
    }
    
    return response.json();
  }
};