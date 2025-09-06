import { useState } from 'react';
import { ArrowLeft, Save, Settings, Sparkles } from 'lucide-react';
import { readmeService } from '../../services/readmeService';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';
import { Modal } from '../UI/Modal';
import { ReadmePreview } from '../UI/ReadmePreview';
import { useAuth } from '../../hooks/useAuth';

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
  const { user } = useAuth();
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Generated comprehensive README.md');
  
  // Check if user is authenticated
  const isAuthenticated = !!user;

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
      
      // Use appropriate service method based on authentication status
      const result = isAuthenticated 
        ? await readmeService.generateReadme(
            repository.owner.login,
            repository.name,
            selectedSections,
            customInstructions
          )
        : await readmeService.generatePublicReadme(
            repository.owner.login,
            repository.name,
            selectedSections,
            customInstructions
          );
      
      setGeneratedContent(result.content);
      setShowPreviewModal(true);
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{repository.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{repository.description || 'Generate README for this repository'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Configuration Panel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h3>
          </div>
          
          {/* Section Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sections to Include</h4>
            <div className="grid grid-cols-2 gap-3">
              {sections.map(section => (
                <label key={section.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={section.checked}
                    onChange={() => handleSectionToggle(section.id)}
                    className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{section.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Custom Instructions</h4>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Add any specific requirements or information you'd like to include in the README..."
              className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          
          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || sections.filter(s => s.checked).length === 0}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Generating README...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate README</span>
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} onRetry={handleGenerate} />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="README Preview"
        size="full"
      >
        <div className="space-y-6">
          <ReadmePreview
            content={generatedContent}
            onContentChange={setGeneratedContent}
          />
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              <>
                <div className="flex-1 max-w-md">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commit Message
                  </label>
                  <input
                    type="text"
                    value={saveMessage}
                    onChange={(e) => setSaveMessage(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="ml-4 flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save to Repository'}</span>
                </button>
              </>
            ) : (
              <div className="w-full text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Sign in with GitHub to save README files directly to your repositories
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedContent)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};