import React, { useState } from 'react';

const ConsolePanel = ({ logs, clearLogs, accessToken }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-violet-500 animate-pulse"></span>
          <h3 className="font-mono text-sm font-semibold text-slate-200">HTTP & JWT Token Console</h3>
        </div>
        <button
          onClick={clearLogs}
          className="rounded px-2 py-1 text-xs font-mono text-slate-400 hover:bg-slate-850 hover:text-slate-200 transition"
        >
          Clear Logs
        </button>
      </div>

      <div className="p-4">
        {/* Token storage visualization */}
        {accessToken && (
          <div className="mb-4 rounded-lg bg-slate-950/70 p-3 border border-violet-950/50 font-mono text-[10px] space-y-1">
            <span className="text-violet-400 font-bold block">In-Memory Access Token (JS Memory State):</span>
            <div className="bg-slate-900 rounded p-1.5 text-slate-400 select-all break-all border border-slate-800/40">
              {accessToken}
            </div>
            <span className="text-slate-500 italic block mt-1">
              * Note: Stored solely in browser JS memory context. Immune to XSS cookie-scraping, automatically injected via Axios request interceptors.
            </span>
          </div>
        )}

        {logs.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-800 font-mono text-xs text-slate-500">
            No network events recorded yet. Perform actions above.
          </div>
        ) : (
          <div className="space-y-2 max-h-[350px] overflow-y-auto font-mono text-xs">
            {logs.map((log, index) => {
              const isSuccess = log.status >= 200 && log.status < 300;
              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={index}
                  className={`rounded border transition duration-150 ${
                    isExpanded ? 'border-violet-500/50 bg-slate-950/60' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/20'
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(index)}
                    className="flex cursor-pointer items-center justify-between p-3 select-none"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">{log.timestamp}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold ${
                          log.method === 'GET' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-fuchsia-500/10 text-fuchsia-400'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-slate-300 break-all">{log.url}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold ${
                          log.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                          isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="text-slate-500 text-[10px]">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-800/80 p-3 space-y-3 bg-slate-950/40 text-[11px] leading-relaxed">
                      <div>
                        <div className="font-semibold text-slate-400 mb-1">Request Headers:</div>
                        <pre className="rounded bg-slate-900 p-2 text-violet-300 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.headers, null, 2)}
                        </pre>
                      </div>

                      {log.data && (
                        <div>
                          <div className="font-semibold text-slate-400 mb-1">Request Payload (JSON):</div>
                          <pre className="rounded bg-slate-900 p-2 text-slate-300 overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div>
                        <div className="font-semibold text-slate-400 mb-1">Response Body:</div>
                        <pre className="rounded bg-slate-900 p-2 text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="border-t border-slate-800 bg-slate-950 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Session Storage: In-Memory Bearer + HttpOnly Refresh Cookie</span>
        <span>Mecanismo: Authorization Header (Stateless)</span>
      </div>
    </div>
  );
};

export default ConsolePanel;
