export interface User {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  license?: {
    name: string;
    key: string;
  };
}

export interface ReadmeSection {
  id: string;
  label: string;
  checked: boolean;
}

export interface GenerateReadmeRequest {
  owner: string;
  repo: string;
  sections: string[];
  customInstructions?: string;
}

export interface SaveReadmeRequest {
  owner: string;
  repo: string;
  content: string;
  message?: string;
}