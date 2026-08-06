import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConsolePanel from '../components/ConsolePanel';

const Dashboard = () => {
  const {
    user,
    accessToken,
    logout,
    changePassword,
    simulateRequest,
    requestsLog,
    setRequestsLog,
    API
  } = useContext(AuthContext);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Admin states
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Simulation states
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage('');
    setPwError('');
    setPwLoading(true);

    const result = await changePassword(oldPassword, newPassword);
    setPwLoading(false);

    if (result.success) {
      setPwMessage(result.message);
      setOldPassword('');
      setNewPassword('');
      // Redirect to login after password change
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setPwError(result.error);
    }
  };

  const loadAdminUsers = async () => {
    if (user?.role !== 'ROLE_ADMIN') return;
    setAdminLoading(true);
    setAdminError('');
    try {
      const response = await API.get('/admin/users');
      setAdminUsers(response.data);
    } catch (err) {
      setAdminError(err.response?.data?.error || 'Failed to fetch users list.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleToggleBlock = async (username, isCurrentlyBlocked) => {
    try {
      await API.post('/admin/block', {
        username,
        block: !isCurrentlyBlocked
      });
      loadAdminUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  const handleSimulate = async (endpoint) => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const data = await simulateRequest(endpoint);
      setSimResult({ success: true, data });
    } catch (err) {
      setSimResult({ success: false, error: err.response?.data || err.message });
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN') {
      loadAdminUsers();
    }
  }, [user]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Security Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Active Session Node: <span className="font-mono text-violet-400">Stateless JWT tokens</span>
            </p>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-900/10 hover:brightness-110 transition duration-150"
            >
              Sign Out JWT
            </button>
          </div>
        </div>

        {/* Top Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* User Profile Info Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur space-y-6">
            <h2 className="text-xl font-bold text-slate-200 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-violet-400"></span>
              <span>Identity Profile Details</span>
            </h2>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Username:</span>
                <span className="text-slate-200 font-semibold">{user?.username}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Spring Security Authority:</span>
                <span className="text-violet-400 font-bold">{user?.role}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Authentication Method:</span>
                <span className="text-fuchsia-400">JWT Bearer (Header)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Refresh Token Storage:</span>
                <span className="text-slate-300">HttpOnly strict Cookie</span>
              </div>
            </div>

            {/* Simulated Request section */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Test API Calls (Silent Refresh Demo)</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSimulate('/jwt/profile')}
                  disabled={simLoading}
                  className="rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  GET /jwt/profile
                </button>
                <button
                  onClick={() => handleSimulate('/public/info')}
                  disabled={simLoading}
                  className="rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  GET /public/info
                </button>
              </div>

              {simResult && (
                <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                    <span>STATUS: {simResult.success ? '200 OK' : 'ERROR'}</span>
                    <button onClick={() => setSimResult(null)} className="text-slate-400 hover:text-slate-200">×</button>
                  </div>
                  <pre className="text-[10px] font-mono text-emerald-400 overflow-x-auto">
                    {JSON.stringify(simResult, null, 2)}
                  </pre>
                </div>
              )}
              <p className="text-[10px] text-slate-500 italic">
                * Tip: Access Token expires in 1 minute. Wait 1 min, click "GET /jwt/profile" and watch the Console log. You will see an automatic refresh request before the profile request completes!
              </p>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur">
            <h2 className="text-xl font-bold text-slate-200 flex items-center space-x-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400"></span>
              <span>Update Credentials</span>
            </h2>

            {pwError && (
              <div className="mb-4 rounded-lg bg-red-950/30 border border-red-500/25 p-3 text-xs text-red-400">
                {pwError}
              </div>
            )}
            {pwMessage && (
              <div className="mb-4 rounded-lg bg-emerald-950/30 border border-emerald-500/25 p-3 text-xs text-emerald-400 font-mono">
                {pwMessage}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={pwLoading}
                className="w-full rounded-lg bg-violet-650 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:brightness-110 disabled:opacity-50 transition"
              >
                {pwLoading ? 'Processing...' : 'Apply Password Change'}
              </button>
              <p className="text-[10px] text-slate-500 italic mt-2">
                Note: In stateless JWT setups, a password change deletes the active Refresh Token from the DB, and blacklists the current Access Token, forcing all devices to re-login.
              </p>
            </form>
          </div>
        </div>

        {/* User Administration Panel (Admin Only) */}
        {user?.role === 'ROLE_ADMIN' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-200 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-fuchsia-400"></span>
                <span>User Management Dashboard</span>
              </h2>
              <button
                onClick={loadAdminUsers}
                className="rounded-lg bg-slate-850 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Refresh Accounts
              </button>
            </div>

            {adminError && (
              <div className="mb-4 rounded bg-red-950/20 border border-red-500/20 p-3 text-xs text-red-400">
                {adminError}
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left font-mono text-xs text-slate-400">
                <thead className="bg-slate-950 text-slate-300 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Version</th>
                    <th className="px-6 py-3">State</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/20">
                  {adminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/10">
                      <td className="px-6 py-4">{u.id}</td>
                      <td className="px-6 py-4 text-slate-200 font-semibold">{u.username}</td>
                      <td className="px-6 py-4 text-violet-400">{u.role}</td>
                      <td className="px-6 py-4">{u.passwordVersion}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          u.blocked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {u.blocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleToggleBlock(u.username, u.blocked)}
                            className={`rounded-lg px-3 py-1 text-[10px] font-semibold transition ${
                              u.blocked ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30' : 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30'
                            }`}
                          >
                            {u.blocked ? 'Unblock Account' : 'Block Account'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-3">
              Note: When blocking a user in JWT setups, the database deletes their Refresh Tokens, so they cannot refresh on next access token expiry.
            </p>
          </div>
        )}

        {/* Logs Console */}
        <div className="w-full">
          <ConsolePanel logs={requestsLog} clearLogs={() => setRequestsLog([])} accessToken={accessToken} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
