import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from '../utils/toast';

const MagicLinkVerify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verifyMagicLink = async () => {
      try {
        const response = await api.get(`/auth/magic-link/${token}`);
        
        if (response.data.success) {
          setStatus('success');
          // Store token and user data
          loginWithToken(response.data.data.token, response.data.data.user);
          toast.success(response.data.message || 'Successfully signed in!');
          
          // Redirect after short delay
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          toast.error(response.data.message || 'Invalid or expired magic link');
        }
      } catch (error) {
        console.error('Magic link verification error:', error);
        setStatus('error');
        toast.error(error.response?.data?.message || 'Invalid or expired magic link');
      }
    };

    if (token) {
      verifyMagicLink();
    }
  }, [token, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
          {status === 'verifying' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Verifying Magic Link</h1>
              <p className="text-gray-600">Please wait while we sign you in...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
                <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Success!</h1>
              <p className="text-gray-600 mb-4">You're now signed in. Redirecting...</p>
              <div className="flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faSpinner} spin className="text-primary" />
                <span className="text-sm text-gray-500">Taking you to your dashboard</span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h1>
              <p className="text-gray-600 mb-6">
                This magic link is invalid or has expired. Magic links expire after 15 minutes for security.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagicLinkVerify;
