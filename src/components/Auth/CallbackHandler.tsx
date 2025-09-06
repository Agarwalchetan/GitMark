import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const CallbackHandler: React.FC = () => {
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        
        if (error) {
          console.error('OAuth error:', error);
          // Redirect to home with error
          window.location.href = '/?error=' + error;
          return;
        }

        // Wait a moment for the server to process the callback
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check auth status
        await checkAuthStatus();
        
        // Clean up URL and redirect to main app
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Force a page reload to ensure the auth context updates properly
        window.location.href = '/';
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        // Redirect to home with error
        window.location.href = '/?error=callback_failed';
      }
    };

    handleCallback();
  }, [checkAuthStatus]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoadingSpinner message="Completing authentication..." />
    </div>
  );
};