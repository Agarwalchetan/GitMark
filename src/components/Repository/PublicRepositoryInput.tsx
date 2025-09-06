import { useState } from 'react';
import { Github, Search, AlertCircle } from 'lucide-react';
import { repositoryService } from '../../services/repositoryService';
import { LoadingSpinner } from '../UI/LoadingSpinner';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  owner: {
    login: string;
  };
}

interface PublicRepositoryInputProps {
  onRepositorySelect: (repository: Repository) => void;
}

export const PublicRepositoryInput: React.FC<PublicRepositoryInputProps> = ({ onRepositorySelect }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
    // Remove trailing slash and whitespace
    const cleanUrl = url.trim().replace(/\/$/, '');
    
    // Match various GitHub URL formats
    const patterns = [
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)$/,
      /^github\.com\/([^\/]+)\/([^\/]+)$/,
      /^([^\/]+)\/([^\/]+)$/
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError('Invalid GitHub repository URL. Use format: github.com/owner/repo or owner/repo');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const repository = await repositoryService.getPublicRepositoryDetails(parsed.owner, parsed.repo);
      onRepositorySelect(repository);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repository');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Github className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Generate README for Public Repository
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a GitHub repository URL to generate a README file
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repository URL
            </label>
            <div className="relative">
              <input
                id="repo-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repository or owner/repository"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Supported formats: github.com/owner/repo, owner/repo, or full URL
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Loading Repository...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Load Repository</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Examples:</h3>
          <div className="space-y-2">
            {[
              'facebook/react',
              'microsoft/vscode',
              'https://github.com/vercel/next.js'
            ].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setUrl(example)}
                className="block w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
