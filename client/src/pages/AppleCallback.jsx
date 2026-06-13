import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AppleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const idToken = searchParams.get('id_token');
    const user = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'APPLE_AUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
      } else {
        navigate('/login', { state: { error: 'Apple authentication failed' } });
      }
      return;
    }

    if (code) {
      // Send success to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'APPLE_AUTH_SUCCESS',
          code: code,
          idToken: idToken,
          user: user ? JSON.parse(user) : null
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
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Completing Apple sign-in...</p>
      </div>
    </div>
  );
};

export default AppleCallback;
