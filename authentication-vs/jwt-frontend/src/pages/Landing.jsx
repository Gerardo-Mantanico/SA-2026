import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative gradient glowing blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-fuchsia-650/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl text-center space-y-8 z-10">
        <div className="inline-flex items-center space-x-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-3 py-1 text-xs text-violet-400 font-mono">
          <span>Stateless JWT Authentication Node</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          JWT-Based Authentication
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Explore stateless authorization. Here, authentication is verified via signatures without active sessions in server memory. The client receives a short-lived <span className="text-violet-400 font-mono font-semibold">Access Token</span> (stored in JS memory) and a long-lived <span className="text-fuchsia-400 font-mono font-semibold">Refresh Token</span> stored in an HttpOnly cookie.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 transition hover:brightness-110 hover:scale-[1.02]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 transition hover:brightness-110 hover:scale-[1.02]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 px-8 py-3.5 text-sm font-semibold transition hover:scale-[1.02]"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur hover:border-slate-700 transition duration-350">
            <div className="text-violet-400 font-bold mb-2">Bearer Authorization</div>
            <p className="text-sm text-slate-400">
              The short-lived Access Token is attached as a <span className="font-mono text-slate-200 text-xs">Bearer</span> header. Storing it in JS memory protects it from CSRF and local storage extraction.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur hover:border-slate-700 transition duration-350">
            <div className="text-fuchsia-400 font-bold mb-2">Silent Token Refresh</div>
            <p className="text-sm text-slate-400">
              If an access token expires (configured to 1 minute), the Axios response interceptor silently requests a new one using the HTTP-Only refresh cookie.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur hover:border-slate-700 transition duration-350">
            <div className="text-cyan-400 font-bold mb-2">Blacklisting on Logout</div>
            <p className="text-sm text-slate-400">
              To handle stateless logouts, active tokens are cached in a database blacklist on the server until their expiration time, immediate revoking access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
