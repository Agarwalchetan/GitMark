import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { AuthSection } from './components/Auth/AuthSection';
import { CallbackHandler } from './components/Auth/CallbackHandler';
import { RepositorySelector } from './components/Repository/RepositorySelector';
import { ReadmeGenerator } from './components/Generator/ReadmeGenerator';
import { LoadingSpinner } from './components/UI/LoadingSpinner';
import { useAuth } from './hooks/useAuth';

function AppContent() {
  const { user, loading } = useAuth();
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [currentStep, setCurrentStep] = useState('auth');
  
  
  // Check if this is an OAuth callback
  const isCallback = window.location.search.includes('code=') || window.location.search.includes('error=');

  if (isCallback) {
    return <CallbackHandler />;
  }

  useEffect(() => {
    if (user && currentStep === 'auth') {
      setCurrentStep('repository');
    } else if (!user && currentStep === 'repository') {
      setCurrentStep('auth');
      setSelectedRepository(null);
    }
  }, [user, currentStep]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Initializing application..." />
      </div>
    );
  }

  const handleRepositorySelect = (repo: any) => {
    setSelectedRepository(repo);
    setCurrentStep('generate');
  };

  const handleBackToRepos = () => {
    setSelectedRepository(null);
    setCurrentStep(user ? 'repository' : 'auth');
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {currentStep === 'auth' && (
          <AuthSection onRepositorySelect={handleRepositorySelect} />
        )}
        
        {currentStep === 'repository' && user && (
          <RepositorySelector 
            onRepositorySelect={handleRepositorySelect}
          />
        )}

        {currentStep === 'generate' && selectedRepository && (
          <ReadmeGenerator 
            repository={selectedRepository}
            onBack={handleBackToRepos}
          />
        )}
        
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;