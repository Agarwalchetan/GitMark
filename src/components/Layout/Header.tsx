import React, { useState, useEffect } from 'react';
import { FileText, LogOut, Sun, Moon, Star, GitFork, ExternalLink } from 'lucide-react';
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
            {/* Premium Project Stats */}
            {projectStats && (
              <div className="hidden lg:flex items-center bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300">
                <a
                  href={projectStats.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-sm">Open Source</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                
                <div className="flex items-center space-x-4 px-4 py-3">
                  <div className="flex items-center space-x-1.5 group cursor-default">
                    <div className="p-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-md group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                      <Star className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{projectStats.stars.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden xl:inline">stars</span>
                  </div>
                  
                  <div className="flex items-center space-x-1.5 group cursor-default">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <GitFork className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{projectStats.forks.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden xl:inline">forks</span>
                  </div>
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