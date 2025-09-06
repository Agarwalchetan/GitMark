import React, { useState } from 'react';
import { ArrowLeft, Download, Save, Eye, Settings } from 'lucide-react';
import { readmeService } from '../../services/readmeService';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';

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

interface ReadmeGeneratorProps {
  repository: Repository;
  onBack: () => void;
}

const DEFAULT_SECTIONS = [
  { id: 'description', label: 'Description', checked: true },
  { id: 'installation', label: 'Installation', checked: true },
  { id: 'usage', label: 'Usage', checked: true },
  { id: 'api', label: 'API Reference', checked: false },
  { id: 'contributing', label: 'Contributing', checked: true },
  { id: 'license', label: 'License', checked: true }
];

export const ReadmeGenerator: React.FC<ReadmeGeneratorProps> = ({ repository, onBack }) => {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Generated comprehensive README.md');

  const handleSectionToggle = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId 
        ? { ...section, checked: !section.checked }
        : section
    ));
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const selectedSections = sections
        .filter(section => section.checked)
        .map(section => section.id);
      
      const result = await readmeService.generateReadme(
        repository.owner.login,
        repository.name,
        selectedSections,
        customInstructions
      );
      
      setGeneratedContent(result.content);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate README');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      await readmeService.saveReadme(
        repository.owner.login,
        repository.name,
        generatedContent,
        saveMessage
      );
      
      alert('README saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save README');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadReadme = () => {
    const blob = new Blob([generatedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{repository.name}</h2>
            <p className="text-gray-400">{repository.description || 'Generate README for this repository'}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Configuration</h3>
            </div>
            
            {/* Section Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Sections to Include</h4>
              <div className="space-y-2">
                {sections.map(section => (
                  <label key={section.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={section.checked}
                      onChange={() => handleSectionToggle(section.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">{section.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Custom Instructions */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Custom Instructions</h4>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Add any specific requirements or information you'd like to include in the README..."
                className="w-full h-24 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
            
            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || sections.filter(s => s.checked).length === 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generating README...</span>
                </>
              ) : (
                <span>Generate README</span>
              )}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {error && (
            <ErrorMessage message={error} onRetry={handleGenerate} />
          )}
          
          {generatedContent && (
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                      showPreview 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                  <span className="text-gray-500">|</span>
                  <span className="text-sm text-gray-400">README.md</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={downloadReadme}
                    className="flex items-center space-x-1 px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save to Repo'}</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {showPreview ? (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      {generatedContent}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="w-full h-96 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm resize-none"
                    />
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Commit Message</label>
                        <input
                          type="text"
                          value={saveMessage}
                          onChange={(e) => setSaveMessage(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};