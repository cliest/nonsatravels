import React, { useState } from 'react';
import api from '../services/api';

// Social Provider Logos
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
    <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97 3.92 6.02 6.62 10.71 6.62z"/>
    <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98c-.82 1.62-1.29 3.44-1.29 5.38s.47 3.76 1.29 5.38l3.98-3.09z"/>
    <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42c-2.07-1.94-4.78-3.13-8.02-3.13-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const SocialAuthButtons = ({ onSuccess, onError, mode = 'signin' }) => {
  const [loadingProvider, setLoadingProvider] = useState(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID;

  const buttonText = mode === 'signup' ? 'Sign up with' : 'Continue with';

  // Google OAuth
  const handleGoogleAuth = () => {
    if (!googleClientId) {
      onError?.('Google Sign-In is not configured. Please contact support.');
      return;
    }

    setLoadingProvider('google');

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'openid email profile';
    const responseType = 'id_token';
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', googleClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', responseType);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('prompt', 'select_account');

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl.toString(),
      'google-auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      setLoadingProvider(null);
      onError?.('Popup blocked. Please allow popups and try again.');
      return;
    }

    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          setLoadingProvider(null);
        }
      } catch (e) {
        // COOP may block access to popup.closed
      }
    }, 1000);

    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.credential) {
        clearInterval(checkPopup);
        
        try {
          const result = await api.post('/auth/google', { credential: event.data.credential });
          if (result.data.success) {
            onSuccess?.(result.data);
          } else {
            onError?.(result.data.message || 'Authentication failed');
          }
        } catch (error) {
          onError?.(error.response?.data?.message || 'Authentication failed');
        } finally {
          setLoadingProvider(null);
        }
      }
    }, { once: true });
  };

  // Facebook OAuth
  const handleFacebookAuth = () => {
    if (!facebookAppId) {
      onError?.('Facebook Sign-In is not configured. Please contact support.');
      return;
    }

    setLoadingProvider('facebook');

    const redirectUri = `${window.location.origin}/auth/facebook/callback`;
    const scope = 'email,public_profile';
    const state = Math.random().toString(36).substring(2, 15);
    
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', facebookAppId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl.toString(),
      'facebook-auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      setLoadingProvider(null);
      onError?.('Popup blocked. Please allow popups and try again.');
      return;
    }

    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          setLoadingProvider(null);
        }
      } catch (e) {
        // COOP may block access to popup.closed
      }
    }, 1000);

    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'FACEBOOK_AUTH_SUCCESS' && event.data?.code) {
        clearInterval(checkPopup);
        
        try {
          const result = await api.post('/auth/facebook', { 
            code: event.data.code,
            redirectUri 
          });
          if (result.data.success) {
            onSuccess?.(result.data);
          } else {
            onError?.(result.data.message || 'Authentication failed');
          }
        } catch (error) {
          onError?.(error.response?.data?.message || 'Authentication failed');
        } finally {
          setLoadingProvider(null);
        }
      }
    }, { once: true });
  };

  // Apple OAuth
  const handleAppleAuth = () => {
    if (!appleClientId) {
      onError?.('Apple Sign-In is not configured. Please contact support.');
      return;
    }

    setLoadingProvider('apple');

    const redirectUri = `${window.location.origin}/auth/apple/callback`;
    const scope = 'name email';
    const state = Math.random().toString(36).substring(2, 15);
    
    const authUrl = new URL('https://appleid.apple.com/auth/authorize');
    authUrl.searchParams.set('client_id', appleClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code id_token');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_mode', 'form_post');

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl.toString(),
      'apple-auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      setLoadingProvider(null);
      onError?.('Popup blocked. Please allow popups and try again.');
      return;
    }

    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          setLoadingProvider(null);
        }
      } catch (e) {
        // COOP may block access to popup.closed
      }
    }, 1000);

    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'APPLE_AUTH_SUCCESS' && event.data?.code) {
        clearInterval(checkPopup);
        
        try {
          const result = await api.post('/auth/apple', { 
            code: event.data.code,
            idToken: event.data.idToken,
            user: event.data.user
          });
          if (result.data.success) {
            onSuccess?.(result.data);
          } else {
            onError?.(result.data.message || 'Authentication failed');
          }
        } catch (error) {
          onError?.(error.response?.data?.message || 'Authentication failed');
        } finally {
          setLoadingProvider(null);
        }
      }
    }, { once: true });
  };

  return (
    <div className="space-y-3">
      {/* Google */}
      {googleClientId && (
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loadingProvider !== null}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
        >
          {loadingProvider === 'google' ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"/>
          ) : (
            <GoogleIcon />
          )}
          <span className="font-medium text-gray-700">{buttonText} Google</span>
        </button>
      )}

      {/* Facebook */}
      {facebookAppId && (
        <button
          type="button"
          onClick={handleFacebookAuth}
          disabled={loadingProvider !== null}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
        >
          {loadingProvider === 'facebook' ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"/>
          ) : (
            <FacebookIcon />
          )}
          <span className="font-medium text-gray-700">{buttonText} Facebook</span>
        </button>
      )}

      {/* Apple */}
      {appleClientId && (
        <button
          type="button"
          onClick={handleAppleAuth}
          disabled={loadingProvider !== null}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-900 rounded-lg bg-black text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
        >
          {loadingProvider === 'apple' ? (
            <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin"/>
          ) : (
            <AppleIcon />
          )}
          <span className="font-medium">{buttonText} Apple</span>
        </button>
      )}

      {/* Show message if no providers configured */}
      {!googleClientId && !facebookAppId && !appleClientId && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Social sign-in is currently unavailable
        </div>
      )}
    </div>
  );
};

export default SocialAuthButtons;
