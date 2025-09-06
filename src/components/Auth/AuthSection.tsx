import React from 'react';
import { Github, Shield, Zap, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AuthSection: React.FC = () => {
  const { login, loading } = useAuth();

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">README Generator</h1>
        </div>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Generate comprehensive, AI-powered README files for your GitHub repositories. 
          Support for both public and private repositories with secure OAuth authentication.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Secure Access</h3>
          <p className="text-gray-400">OAuth authentication ensures secure access to your private repositories without compromising your credentials.</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
          <p className="text-gray-400">Advanced AI analyzes your codebase and generates contextually relevant, comprehensive documentation.</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Github className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">GitHub Integration</h3>
          <p className="text-gray-400">Seamlessly integrate with GitHub to access repository metadata and save generated READMEs directly.</p>
        </div>
      </div>

      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Get Started</h2>
        <p className="text-gray-300 mb-6">
          Connect your GitHub account to access your repositories and start generating professional README files.
        </p>
        
        <button
          onClick={login}
          disabled={loading}
          className="inline-flex items-center space-x-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
        >
          <Github className="w-5 h-5" />
          <span>{loading ? 'Connecting...' : 'Connect with GitHub'}</span>
        </button>
        
        <p className="text-xs text-gray-500 mt-4 max-w-md mx-auto">
          We'll only request the minimum permissions needed to read your repositories and generate READMEs.
        </p>
      </div>
    </div>
  );
};