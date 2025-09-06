import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const CallbackHandler: React.FC = () => {
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a moment for the server to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        await checkAuthStatus();
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('OAuth callback error:', error);
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