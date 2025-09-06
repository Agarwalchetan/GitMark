import React, { useState, useEffect } from 'react';
import { Github, FileText, LogOut, Sun, Moon, Star, GitFork, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { githubStatsService } from '../../services/githubStatsService';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [projectStats, setProjectStats] = useState<{ stars: number; forks: number; url: string } | null>(null);

  useEffect(() => {
    const loadProjectStats = async () => {
      try {
        const stats = await githubStatsService.getProjectStats();
        setProjectStats(stats);
      } catch (error) {
        console.error('Failed to load project stats:', error);
      }
    };

    loadProjectStats();
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg transition-colors">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">GitMark</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered README generator</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Project Stats */}
            {projectStats && (
              <div className="hidden md:flex items-center space-x-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <a
                  href={projectStats.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <span className="font-medium">Open Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4" />
                  <span>{projectStats.stars}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <GitFork className="w-4 h-4" />
                  <span>{projectStats.forks}</span>
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={user.avatar_url} 
                    alt={user.name || user.login}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  />
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || user.login}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">@{user.login}</p>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};