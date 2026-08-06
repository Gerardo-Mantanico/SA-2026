import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConsolePanel from '../components/ConsolePanel';

const Register = () => {
  const { register, requestsLog, setRequestsLog } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const result = await register(username, password, role);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message + ' Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Or{' '}
            <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition">
              sign in to existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-sm text-red-400 border-l-4 border-l-red-500">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3 text-sm text-emerald-400 border-l-4 border-l-emerald-500">
            {successMsg}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="relative block w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-slate-200 placeholder-slate-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition"
                placeholder="e.g. dev_user"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-slate-200 placeholder-slate-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Role Choice
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="relative block w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-slate-200 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition"
              >
                <option value="ROLE_USER" className="bg-slate-900 text-slate-200">Regular User (ROLE_USER)</option>
                <option value="ROLE_ADMIN" className="bg-slate-900 text-slate-200">Administrator (ROLE_ADMIN)</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 focus:outline-none disabled:opacity-50 transition duration-200 hover:scale-[1.01]"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Register Account'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="w-full max-w-4xl">
        <ConsolePanel logs={requestsLog} clearLogs={() => setRequestsLog([])} />
      </div>
    </div>
  );
};

export default Register;
