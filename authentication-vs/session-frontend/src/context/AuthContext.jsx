import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios default base URL and credentials
const API = axios.create({
  baseURL: 'http://localhost:8081/api',
  withCredentials: true
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestsLog, setRequestsLog] = useState([]);

  // Log API requests for the console comparison
  const logRequest = (method, url, headers, data, status, response) => {
    setRequestsLog(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        method,
        url,
        headers,
        data,
        status,
        response
      },
      ...prev.slice(0, 19) // Keep last 20 requests
    ]);
  };

  const checkAuth = async () => {
    try {
      const response = await API.get('/session/profile');
      logRequest('GET', '/api/session/profile', { Cookie: 'JSESSIONID=****** (managed by browser)' }, null, response.status, response.data);
      setUser(response.data);
    } catch (err) {
      logRequest('GET', '/api/session/profile', { Cookie: 'JSESSIONID=******' }, null, err.response?.status || 500, err.response?.data || { error: err.message });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await API.post('/session/login', { username, password });
      logRequest('POST', '/api/session/login', { 'Content-Type': 'application/json' }, { username, password: '***' }, response.status, response.data);
      setUser({
        username: response.data.username,
        role: response.data.role
      });
      return { success: true };
    } catch (err) {
      logRequest('POST', '/api/session/login', { 'Content-Type': 'application/json' }, { username, password: '***' }, err.response?.status || 500, err.response?.data || { error: err.message });
      const errMsg = err.response?.data?.error || 'Invalid credentials or connection error.';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const response = await API.post('/session/logout');
      logRequest('POST', '/api/session/logout', { Cookie: 'JSESSIONID=******' }, null, response.status, response.data);
    } catch (err) {
      logRequest('POST', '/api/session/logout', { Cookie: 'JSESSIONID=******' }, null, err.response?.status || 500, err.response?.data || { error: err.message });
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const register = async (username, password, role) => {
    try {
      const response = await API.post('/public/register', { username, password, role });
      logRequest('POST', '/api/public/register', { 'Content-Type': 'application/json' }, { username, password: '***', role }, response.status, response.data);
      return { success: true, message: response.data.message };
    } catch (err) {
      logRequest('POST', '/api/public/register', { 'Content-Type': 'application/json' }, { username, password: '***', role }, err.response?.status || 500, err.response?.data || { error: err.message });
      const errMsg = err.response?.data?.error || 'Registration failed.';
      return { success: false, error: errMsg };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await API.post('/session/change-password', { oldPassword, newPassword });
      logRequest('POST', '/api/session/change-password', { Cookie: 'JSESSIONID=******' }, { oldPassword: '***', newPassword: '***' }, response.status, response.data);
      setUser(null); // Stateful logout occurs on password change
      return { success: true, message: response.data.message };
    } catch (err) {
      logRequest('POST', '/api/session/change-password', { Cookie: 'JSESSIONID=******' }, { oldPassword: '***', newPassword: '***' }, err.response?.status || 500, err.response?.data || { error: err.message });
      const errMsg = err.response?.data?.error || 'Password change failed.';
      return { success: false, error: errMsg };
    }
  };

  const simulateRequest = async (endpoint) => {
    try {
      const response = await API.get(endpoint);
      logRequest('GET', `/api${endpoint}`, { Cookie: 'JSESSIONID=******' }, null, response.status, response.data);
      return response.data;
    } catch (err) {
      logRequest('GET', `/api${endpoint}`, { Cookie: 'JSESSIONID=******' }, null, err.response?.status || 500, err.response?.data || { error: err.message });
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      requestsLog,
      login,
      logout,
      register,
      changePassword,
      simulateRequest,
      checkAuth,
      setRequestsLog,
      API
    }}>
      {children}
    </AuthContext.Provider>
  );
};
