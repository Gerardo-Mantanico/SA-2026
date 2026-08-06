import React, { useState } from 'react';

const ConsolePanel = ({ logs, clearLogs }) => {
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
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-cyan-500 animate-pulse"></span>
          <h3 className="font-mono text-sm font-semibold text-slate-200">HTTP & Session Console</h3>
        </div>
        <button
          onClick={clearLogs}
          className="rounded px-2 py-1 text-xs font-mono text-slate-400 hover:bg-slate-850 hover:text-slate-200 transition"
        >
          Clear Logs
        </button>
      </div>

      <div className="p-4">
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
                    isExpanded ? 'border-indigo-500/50 bg-slate-950/60' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/20'
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
                          log.method === 'GET' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-violet-500/10 text-violet-400'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-slate-300 break-all">{log.url}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold ${
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
                        <pre className="rounded bg-slate-900 p-2 text-indigo-300 overflow-x-auto whitespace-pre-wrap">
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
        <span>Session Storage: Browser Cookie Container</span>
        <span>Mecanismo: JSESSIONID (Stateful)</span>
      </div>
    </div>
  );
};

export default ConsolePanel;
