import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoginRequest } from '../../types';
import appContentStyles from '../../components/AppContent.module.css';
import loginPageStyles from './LoginPage.module.css';
import { authAPI } from '../../apis/authApis';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      
      // Store token in localStorage
      console.log('Login response:', response);
      console.log('Access token:', response.access_token);
      
      if (!response.access_token) {
        throw new Error('No access token received from server');
      }
      
      localStorage.setItem('authToken', response.access_token);
      
      // Store refresh token if available
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
        console.log('Refresh token stored in localStorage');
      }
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        // Create a default user object if not provided
        localStorage.setItem('user', JSON.stringify({
          username: formData.username,
          email: formData.username + '@example.com'
        }));
      }
      
      // Verify token was stored correctly
      const storedToken = localStorage.getItem('authToken');
      console.log('Token stored in localStorage:', storedToken);
      console.log('Token length:', storedToken?.length);
      
      if (!storedToken) {
        throw new Error('Failed to store token in localStorage');
      }
      
      // Navigate to dashboard
      navigate('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className={appContentStyles.loginPage || loginPageStyles.loginPage}>
      <div className={appContentStyles.loginContainer || loginPageStyles.loginContainer}>
        <div className={appContentStyles.loginHeader || loginPageStyles.loginHeader}>
          <h1 className={appContentStyles.loginTitle || loginPageStyles.loginTitle}>RBAC Dashboard</h1>
          <p className={appContentStyles.loginSubtitle || loginPageStyles.loginSubtitle}>Sign in to your account</p>
        </div>
        
        <form className={appContentStyles.loginForm || loginPageStyles.loginForm} onSubmit={handleSubmit}>
          {error && (
            <div className={appContentStyles.errorMessage || loginPageStyles.errorMessage}>
              {error}
            </div>
          )}
          
          <div className={appContentStyles.formGroup || loginPageStyles.formGroup}>
            <label htmlFor="username" className={appContentStyles.formLabel || loginPageStyles.formLabel}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={appContentStyles.formInput || loginPageStyles.formInput}
              required
              disabled={loading}
            />
          </div>
          
          <div className={appContentStyles.formGroup || loginPageStyles.formGroup}>
            <label htmlFor="password" className={appContentStyles.formLabel || loginPageStyles.formLabel}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={appContentStyles.formInput || loginPageStyles.formInput}
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            className={appContentStyles.loginButton || loginPageStyles.loginButton}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
