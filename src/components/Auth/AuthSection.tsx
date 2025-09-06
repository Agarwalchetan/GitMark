import React, { useState } from 'react';
import { Github, Shield, Zap, FileText, Globe, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AuthSection: React.FC = () => {
  const { login, loading } = useAuth();
  const [repoType, setRepoType] = useState<'public' | 'private'>('public');

  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">GitMark</h1>
        </div>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Generate comprehensive, AI-powered README files for your GitHub repositories. 
          Works with both public and private repositories.
        </p>
      </div>

      {/* Repository Type Selection */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Choose Repository Type</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setRepoType('public')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              repoType === 'public'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Globe className={`w-6 h-6 mb-2 ${repoType === 'public' ? 'text-blue-600' : 'text-gray-500'}`} />
            <span className={`font-medium ${repoType === 'public' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
              Public Repos
            </span>
            <span className="text-xs text-gray-500 mt-1">No auth required</span>
          </button>
          
          <button
            onClick={() => setRepoType('private')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              repoType === 'private'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Lock className={`w-6 h-6 mb-2 ${repoType === 'private' ? 'text-blue-600' : 'text-gray-500'}`} />
            <span className={`font-medium ${repoType === 'private' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
              Private Repos
            </span>
            <span className="text-xs text-gray-500 mt-1">OAuth required</span>
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure Access</h3>
          <p className="text-gray-600 dark:text-gray-400">OAuth authentication for private repos ensures secure access without compromising your credentials.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered</h3>
          <p className="text-gray-600 dark:text-gray-400">Advanced AI analyzes your codebase and generates contextually relevant, comprehensive documentation.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Github className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">GitHub Integration</h3>
          <p className="text-gray-600 dark:text-gray-400">Seamlessly integrate with GitHub to access repository metadata and save generated READMEs directly.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Get Started</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {repoType === 'public' 
            ? 'Enter any public GitHub repository URL to generate a README instantly.'
            : 'Connect your GitHub account to access your private repositories and start generating professional README files.'
          }
        </p>
        
        {repoType === 'private' ? (
          <button
            onClick={login}
            disabled={loading}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Github className="w-5 h-5" />
            <span>{loading ? 'Connecting...' : 'Connect with GitHub'}</span>
          </button>
        ) : (
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="https://github.com/username/repository"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <button className="w-full px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Generate README
            </button>
          </div>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 max-w-md mx-auto">
          {repoType === 'private' 
            ? "We'll only request the minimum permissions needed to read your repositories and generate READMEs."
            : "No authentication required for public repositories. Your data stays secure."
          }
        </p>
      </div>
    </div>
  );
};