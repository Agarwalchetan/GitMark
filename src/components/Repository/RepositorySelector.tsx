import React, { useState, useEffect } from 'react';
import { Search, Lock, Globe, GitFork, Star, Calendar } from 'lucide-react';
import { repositoryService } from '../../services/repositoryService';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';

interface Repository {
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
}

interface RepositorySelectorProps {
  onRepositorySelect: (repository: Repository) => void;
}

export const RepositorySelector: React.FC<RepositorySelectorProps> = ({ onRepositorySelect }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    loadRepositories();
  }, []);

  useEffect(() => {
    filterRepositories();
  }, [searchTerm, filter, repositories]);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const repos = await repositoryService.getUserRepositories();
      setRepositories(repos);
    } catch (err: any) {
      setError(err.message || 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const filterRepositories = () => {
    let filtered = repositories;
    
    // Filter by privacy
    if (filter === 'public') {
      filtered = filtered.filter(repo => !repo.private);
    } else if (filter === 'private') {
      filtered = filtered.filter(repo => repo.private);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRepos(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-red-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-500',
      'PHP': 'bg-purple-500'
    };
    
    return colors[language] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner message="Loading your repositories..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage 
          message={error} 
          onRetry={loadRepositories}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Select Repository</h2>
        <p className="text-gray-600 dark:text-gray-300">Choose a repository to generate a comprehensive README file.</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All ({repositories.length})
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'public' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Public ({repositories.filter(r => !r.private).length})
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'private' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Private ({repositories.filter(r => r.private).length})
            </button>
          </div>
        </div>
      </div>

      {/* Repository Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRepos.map((repo) => (
          <div
            key={repo.id}
            onClick={() => onRepositorySelect(repo)}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all cursor-pointer group transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {repo.name}
                </h3>
                {repo.private ? (
                  <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                ) : (
                  <Globe className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {repo.description || 'No description available'}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-4">
                {repo.language && (
                  <div className="flex items-center space-x-1">
                    <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                    <span>{repo.language}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork className="w-3 h-3" />
                  <span>{repo.forks_count}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Updated {formatDate(repo.updated_at)}</span>
            </div>
          </div>
        ))}
      </div>
      
      {filteredRepos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No repositories found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm 
              ? 'Try adjusting your search terms or filters.'
              : 'You don\'t have any repositories yet.'}
          </p>
        </div>
      )}
    </div>
  );
};