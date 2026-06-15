import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faSpinner, faCheckCircle, faExclamationCircle, faMagic } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';
import SocialAuthButtons from '../components/SocialAuthButtons';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithToken } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Load saved email if "Remember Me" was checked previously
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if temporarily blocked
    if (isBlocked) {
      toast.error('Too many failed attempts. Please try again in a few minutes.');
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Handle Remember Me
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Reset login attempts
      setLoginAttempts(0);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      // Track failed attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Block after 5 failed attempts
      if (newAttempts >= 5) {
        setIsBlocked(true);
        setTimeout(() => {
          setIsBlocked(false);
          setLoginAttempts(0);
        }, 300000); // 5 minutes
        toast.error('Too many failed attempts. Please try again in 5 minutes.');
      } else {
        toast.error(result.message || 'Invalid email or password');
      }
    }
    
    setLoading(false);
  };

  const handleSocialAuthSuccess = (data) => {
    // Store token and user data
    loginWithToken(data.data.token, data.data.user);
    toast.success(data.message || 'Welcome!');
    navigate(from, { replace: true });
  };

  const handleSocialAuthError = (message) => {
    toast.error(message || 'Authentication failed');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your Nonsa Travels account</p>
          </div>

          {/* Social Sign In */}
          <div className="mb-6">
            <SocialAuthButtons 
              onSuccess={handleSocialAuthSuccess}
              onError={handleSocialAuthError}
              mode="signin"
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or use password</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-secondary font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Login Attempts Warning */}
            {loginAttempts > 0 && loginAttempts < 5 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  {loginAttempts === 1 ? 'Invalid credentials. Please try again.' : `${loginAttempts} failed attempts. ${5 - loginAttempts} remaining.`}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isBlocked}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Signing in...
                </>
              ) : isBlocked ? (
                <>
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  Account Temporarily Locked
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-secondary transition-colors">
              Sign up
            </Link>
          </p>

          {/* Security Note */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faLock} className="text-green-600" />
              Your connection is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
