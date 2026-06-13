import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

// Google Logo SVG Component
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 0, 0)">
      <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
      <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97 3.92 6.02 6.62 10.71 6.62z"/>
      <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98c-.82 1.62-1.29 3.44-1.29 5.38s.47 3.76 1.29 5.38l3.98-3.09z"/>
      <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42c-2.07-1.94-4.78-3.13-8.02-3.13-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
    </g>
  </svg>
);

const GoogleSignInButton = ({ onSuccess, onError, text = 'signin_with' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const buttonText = text === 'signup_with' ? 'Sign up with Google' : 'Sign in with Google';
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback(async (credential) => {
    if (!credential) {
      onError?.('No credential received from Google');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.post('/auth/google', { credential });

      if (result.data.success) {
        onSuccess?.(result.data);
      } else {
        onError?.(result.data.message || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      onError?.(error.response?.data?.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    // Listen for message from popup
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.credential) {
        handleCredentialResponse(event.data.credential);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleCredentialResponse]);

  const handleGoogleClick = () => {
    if (!clientId) {
      onError?.('Google Sign-In is not configured');
      return;
    }

    setIsLoading(true);

    // Build the OAuth URL
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'openid email profile';
    const responseType = 'id_token';
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', responseType);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('prompt', 'select_account');

    // Calculate popup position (centered)
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open popup
    const popup = window.open(
      authUrl.toString(),
      'google-auth',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      setIsLoading(false);
      onError?.('Popup was blocked. Please allow popups and try again.');
      return;
    }

    // Poll for popup close and handle redirect
    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          setIsLoading(false);
        } else if (popup.location.href.includes(window.location.origin)) {
          // Popup redirected back to our domain
          const hash = popup.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const idToken = params.get('id_token');
          
          if (idToken) {
            handleCredentialResponse(idToken);
          }
          
          popup.close();
          clearInterval(checkPopup);
        }
      } catch (e) {
        // Cross-origin error - popup is still on Google's domain, keep waiting
      }
    }, 500);

    // Safety timeout
    setTimeout(() => {
      clearInterval(checkPopup);
      if (!popup.closed) {
        popup.close();
      }
      setIsLoading(false);
    }, 120000); // 2 minute timeout
  };

  if (!clientId) {
    return null; // Don't render if not configured
  }

  return (
    <button
      onClick={handleGoogleClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
    >
      {isLoading ? (
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
          <span className="font-medium text-gray-700">Signing in...</span>
        </>
      ) : (
        <>
          <GoogleLogo />
          <span className="font-medium text-gray-700">{buttonText}</span>
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;
