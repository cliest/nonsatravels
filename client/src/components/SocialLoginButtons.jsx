import React, { useState } from 'react';
import GoogleSignInButton from './GoogleSignInButton';

// GitHub Logo Component
const GitHubLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="currentColor"
      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
    />
  </svg>
);

// Microsoft Logo Component
const MicrosoftLogo = () => (
  <svg viewBox="0 0 23 23" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path fill="#f25022" d="M0 0h11v11H0z"/>
    <path fill="#00a4ef" d="M12 0h11v11H12z"/>
    <path fill="#7fba00" d="M0 12h11v11H0z"/>
    <path fill="#ffb900" d="M12 12h11v11H12z"/>
  </svg>
);

const SocialLoginButtons = ({ onSuccess, onError, mode = 'signin' }) => {
  const [loadingProvider, setLoadingProvider] = useState(null);
  
  const buttonText = mode === 'signin' ? 'Sign in' : 'Sign up';
  
  const handleGitHubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    
    if (!clientId) {
      onError?.('GitHub Sign-In is not configured');
      return;
    }

    setLoadingProvider('github');

    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = 'read:user user:email';
    
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', Math.random().toString(36).substring(7));

    // Calculate popup position (centered)
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open popup
    const popup = window.open(
      authUrl.toString(),
      'github-auth',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      setLoadingProvider(null);
      onError?.('Popup was blocked. Please allow popups and try again.');
      return;
    }

    // Listen for message from callback
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS' && event.data?.code) {
        window.removeEventListener('message', handleMessage);
        // The callback page will handle the actual API call
      } else if (event.data?.type === 'GITHUB_AUTH_ERROR') {
        window.removeEventListener('message', handleMessage);
        setLoadingProvider(null);
        onError?.(event.data?.message || 'GitHub authentication failed');
      }
    };

    window.addEventListener('message', handleMessage);

    // Poll for popup close
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        window.removeEventListener('message', handleMessage);
        setLoadingProvider(null);
      }
    }, 500);
  };

  const handleMicrosoftLogin = () => {
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
    
    if (!clientId) {
      onError?.('Microsoft Sign-In is not configured');
      return;
    }

    setLoadingProvider('microsoft');

    const redirectUri = `${window.location.origin}/auth/microsoft/callback`;
    const scope = 'openid profile email';
    const responseType = 'id_token';
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', responseType);
    authUrl.searchParams.set('response_mode', 'fragment');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('nonce', nonce);

    // Calculate popup position (centered)
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open popup
    const popup = window.open(
      authUrl.toString(),
      'microsoft-auth',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      setLoadingProvider(null);
      onError?.('Popup was blocked. Please allow popups and try again.');
      return;
    }

    // Poll for popup close
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setLoadingProvider(null);
      }
    }, 500);
  };

  return (
    <div className="space-y-3">
      {/* Google Sign In */}
      <GoogleSignInButton 
        onSuccess={onSuccess}
        onError={onError}
        text={mode === 'signin' ? 'signin_with' : 'signup_with'}
      />

      {/* GitHub Sign In */}
      {import.meta.env.VITE_GITHUB_CLIENT_ID && (
        <button
          onClick={handleGitHubLogin}
          disabled={loadingProvider === 'github'}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
        >
          {loadingProvider === 'github' ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" cy="12" r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                />
              </svg>
              <span className="font-medium text-gray-700">Connecting...</span>
            </>
          ) : (
            <>
              <GitHubLogo />
              <span className="font-medium text-gray-700">{buttonText} with GitHub</span>
            </>
          )}
        </button>
      )}

      {/* Microsoft Sign In */}
      {import.meta.env.VITE_MICROSOFT_CLIENT_ID && (
        <button
          onClick={handleMicrosoftLogin}
          disabled={loadingProvider === 'microsoft'}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
        >
          {loadingProvider === 'microsoft' ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" cy="12" r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                />
              </svg>
              <span className="font-medium text-gray-700">Connecting...</span>
            </>
          ) : (
            <>
              <MicrosoftLogo />
              <span className="font-medium text-gray-700">{buttonText} with Microsoft</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default SocialLoginButtons;
