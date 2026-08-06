import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create Axios instance pointing to the JWT Backend (port 8082)
const API = axios.create({
  baseURL: 'http://localhost:8082/api',
  withCredentials: true // send refresh cookie
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState('');
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

  // Attach Access Token to all outgoing requests
  useEffect(() => {
    const requestInterceptor = API.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
          logRequest(config.method.toUpperCase(), config.url, { ...config.headers }, config.data, 'PENDING', null);
        } else {
          logRequest(config.method.toUpperCase(), config.url, { ...config.headers }, config.data, 'PENDING', null);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      API.interceptors.request.eject(requestInterceptor);
    };
  }, [accessToken]);

  // Handle 401 Unauthorized errors and perform silent refresh
  useEffect(() => {
    const responseInterceptor = API.interceptors.response.use(
      (response) => {
        // Find corresponding pending log and update it
        setRequestsLog(prev => prev.map(log => 
          log.url === response.config.url && log.status === 'PENDING'
            ? { ...log, status: response.status, response: response.data }
            : log
        ));
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status || 500;
        const errData = error.response?.data || { error: error.message };

        // Update pending log with error status
        setRequestsLog(prev => prev.map(log => 
          log.url === originalRequest?.url && log.status === 'PENDING'
            ? { ...log, status, response: errData }
            : log
        ));

        // Attempt refresh on 401 (excluding login route)
        if (status === 401 && !originalRequest._retry && originalRequest.url !== '/jwt/login') {
          originalRequest._retry = true;
          try {
            logRequest('POST', '/api/jwt/refresh', { Cookie: 'refreshToken=****** (managed by browser)' }, null, 'PENDING', null);
            const refreshRes = await axios.post('http://localhost:8082/api/jwt/refresh', {}, { withCredentials: true });
            
            const newAccessToken = refreshRes.data.accessToken;
            setAccessToken(newAccessToken);
            
            // Fetch profile using new token to ensure user state is restored
            const profileRes = await axios.get('http://localhost:8082/api/jwt/profile', {
              headers: { 'Authorization': `Bearer ${newAccessToken}` }
            });
            setUser(profileRes.data);

            // Update refresh log status
            setRequestsLog(prev => prev.map(log => 
              log.url === '/api/jwt/refresh' && log.status === 'PENDING'
                ? { ...log, status: 200, response: refreshRes.data }
                : log
            ));

            // Retry original request with new access token
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshErr) {
            const refreshStatus = refreshErr.response?.status || 401;
            const refreshErrData = refreshErr.response?.data || { error: refreshErr.message };

            setRequestsLog(prev => prev.map(log => 
              log.url === '/api/jwt/refresh' && log.status === 'PENDING'
                ? { ...log, status: refreshStatus, response: refreshErrData }
                : log
            ));

            // Invalidate credentials
            setUser(null);
            setAccessToken('');
            return Promise.reject(refreshErr);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

  // Try to restore session on boot via refresh token
  const checkAuth = async () => {
    try {
      // call refresh to get access token if cookie is present
      const refreshRes = await axios.post('http://localhost:8082/api/jwt/refresh', {}, { withCredentials: true });
      const token = refreshRes.data.accessToken;
      setAccessToken(token);

      const profileRes = await axios.get('http://localhost:8082/api/jwt/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(profileRes.data);
    } catch (err) {
      setUser(null);
      setAccessToken('');
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
      const response = await API.post('/jwt/login', { username, password });
      setAccessToken(response.data.token); // Store token in JS memory
      setUser({
        username: response.data.username,
        role: response.data.role
      });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid credentials or connection error.';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await API.post('/jwt/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      setAccessToken('');
      setLoading(false);
    }
  };

  const register = async (username, password, role) => {
    try {
      const response = await API.post('/public/register', { username, password, role });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed.';
      return { success: false, error: errMsg };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await API.post('/jwt/change-password', { oldPassword, newPassword });
      setUser(null);
      setAccessToken('');
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Password change failed.';
      return { success: false, error: errMsg };
    }
  };

  const simulateRequest = async (endpoint) => {
    try {
      const response = await API.get(endpoint);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
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
