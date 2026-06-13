import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FacebookCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'FACEBOOK_AUTH_ERROR',
          error: errorDescription || error
        }, window.location.origin);
        window.close();
      } else {
        navigate('/login', { state: { error: 'Facebook authentication failed' } });
      }
      return;
    }

    if (code) {
      // Send success to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'FACEBOOK_AUTH_SUCCESS',
          code: code
        }, window.location.origin);
        window.close();
      } else {
        navigate('/login', { state: { error: 'Authentication window error' } });
      }
    } else {
      if (window.opener) {
        window.close();
      } else {
        navigate('/login');
      }
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Completing Facebook sign-in...</p>
      </div>
    </div>
  );
};

export default FacebookCallback;
