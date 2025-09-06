const API_BASE_URL = '/api';

export const readmeService = {
  async generateReadme(owner: string, repo: string, sections: string[], customInstructions = '') {
    const response = await fetch(`${API_BASE_URL}/readme/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        owner,
        repo,
        sections,
        customInstructions
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate README');
    }
    
    return response.json();
  },

  // Public README generation (no authentication required)
  async generatePublicReadme(owner: string, repo: string, sections: string[], customInstructions = '') {
    const response = await fetch(`${API_BASE_URL}/readme/generate/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        owner,
        repo,
        sections,
        customInstructions
      })
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found or is private');
      }
      throw new Error('Failed to generate README');
    }
    
    return response.json();
  },

  async saveReadme(owner: string, repo: string, content: string, message = 'Generated README.md') {
    const response = await fetch(`${API_BASE_URL}/readme/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        owner,
        repo,
        content,
        message
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save README');
    }
    
    return response.json();
  }
};