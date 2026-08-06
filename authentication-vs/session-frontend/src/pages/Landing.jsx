import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative gradient glowing blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl text-center space-y-8 z-10">
        <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 text-xs text-cyan-400 font-mono">
          <span>Stateful Session Authentication Node</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Session-Based Authentication
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Explore stateful user validation. In this application, authentication is managed using a server-side HTTP session, storing the authentication context in memory. The client receives a <span className="text-cyan-400 font-mono font-semibold">JSESSIONID</span> cookie, which the browser automatically manages and transmits.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 transition hover:brightness-110 hover:scale-[1.02]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 transition hover:brightness-110 hover:scale-[1.02]"
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
            <div className="text-cyan-400 font-bold mb-2">Browser-Managed Cookie</div>
            <p className="text-sm text-slate-400">
              The <span className="font-mono text-slate-200 text-xs">JSESSIONID</span> cookie is automatically set, stored, and sent by the browser. No token injection is required in front-end JS.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur hover:border-slate-700 transition duration-350">
            <div className="text-indigo-400 font-bold mb-2">HttpOnly Protection</div>
            <p className="text-sm text-slate-400">
              The cookie is flagged as <span className="font-mono text-slate-200 text-xs">HttpOnly</span>, rendering it inaccessible to client-side scripts, protecting it from XSS theft.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur hover:border-slate-700 transition duration-350">
            <div className="text-violet-400 font-bold mb-2">Stateful Server Logic</div>
            <p className="text-sm text-slate-400">
              The server maintains a registry of sessions. Logging out immediately destroys the session server-side, revoking access globally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
