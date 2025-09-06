import fetch from 'node-fetch';

export class GitHubService {
  static getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: `http://localhost:3001/api/auth/github/callback`,
      scope: 'repo,user:email',
      state: state
    });
    
    return `https://github.com/login/oauth/authorize?${params}`;
  }
  
  static async exchangeCodeForToken(code) {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }
    
    return response.json();
  }
  
  static async getUserInfo(token) {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      const error = new Error('Failed to fetch user info');
      error.status = response.status;
      throw error;
    }
    
    return response.json();
  }
  
  static async getUserRepositories(token, options = {}) {
    const { page = 1, per_page = 30, type = 'all' } = options;
    
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      type: type,
      sort: 'updated'
    });
    
    const response = await fetch(`https://api.github.com/user/repos?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      const error = new Error('Failed to fetch repositories');
      error.status = response.status;
      throw error;
    }
    
    return response.json();
  }
  
  static async getRepositoryDetails(token, owner, repo) {
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // Add authorization header only if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers
    });
    
    if (!response.ok) {
      const error = new Error('Failed to fetch repository details');
      error.status = response.status;
      throw error;
    }
    
    return response.json();
  }

  // Public repository access without authentication
  static async getPublicRepositoryDetails(owner, repo) {
    return this.getRepositoryDetails(null, owner, repo);
  }
  
  static async getRepositoryStructure(token, owner, repo) {
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      // Add authorization header only if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch repository structure');
      }
      
      const data = await response.json();
      return data.tree || [];
    } catch (error) {
      console.error('Error fetching repository structure:', error.message);
      return [];
    }
  }

  // Public repository structure access without authentication
  static async getPublicRepositoryStructure(owner, repo) {
    return this.getRepositoryStructure(null, owner, repo);
  }
  
  static async getFileContent(token, owner, repo, path) {
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      // Add authorization header only if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching file ${path}:`, error.message);
      return null;
    }
  }

  // Public file content access without authentication
  static async getPublicFileContent(owner, repo, path) {
    return this.getFileContent(null, owner, repo, path);
  }
  
  static async gatherRepositoryData(token, owner, repo) {
    try {
      const [details, structure] = await Promise.all([
        this.getRepositoryDetails(token, owner, repo),
        this.getRepositoryStructure(token, owner, repo)
      ]);
      
      // Get important files content
      const importantFiles = [
        'package.json',
        'composer.json',
        'requirements.txt',
        'Gemfile',
        'pom.xml',
        'setup.py',
        'Cargo.toml'
      ];
      
      const fileContents = {};
      
      for (const fileName of importantFiles) {
        const file = structure.find(item => item.path === fileName && item.type === 'blob');
        if (file) {
          const content = await this.getFileContent(token, owner, repo, fileName);
          if (content) {
            fileContents[fileName] = content;
          }
        }
      }
      
      return {
        repository: details,
        structure: structure,
        files: fileContents
      };
    } catch (error) {
      console.error('Error gathering repository data:', error.message);
      throw error;
    }
  }

  // Public repository data gathering without authentication
  static async gatherPublicRepositoryData(owner, repo) {
    return this.gatherRepositoryData(null, owner, repo);
  }
  
  static async saveReadmeFile(token, owner, repo, content, message) {
    // First check if README.md already exists
    let sha = null;
    try {
      const existingFile = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (existingFile.ok) {
        const data = await existingFile.json();
        sha = data.sha;
      }
    } catch (error) {
      // File doesn't exist, which is fine
    }
    
    const body = {
      message: message,
      content: Buffer.from(content).toString('base64'),
      ...(sha && { sha })
    };
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = new Error('Failed to save README file');
      error.status = response.status;
      throw error;
    }
    
    return response.json();
  }
}