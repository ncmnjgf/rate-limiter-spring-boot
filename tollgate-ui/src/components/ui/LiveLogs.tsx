import { useEffect, useRef, useState } from 'react';

export interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  clientIp: string;
  status: number;
  latency: number;
}

export function LiveLogsTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) return;
    
    // Simulate incoming logs via polling/SSE mock
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
        method: 'GET',
        path: '/api/v1/data',
        clientIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
        status: Math.random() > 0.8 ? 429 : 200,
        latency: Math.floor(Math.random() * 150) + 20
      };

      setLogs(prev => {
        const next = [newLog, ...prev];
        return next.length > 500 ? next.slice(0, 500) : next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="flex flex-col h-[400px] w-full rounded-xl bg-black/60 border border-white/10 font-data overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"/> 
          <span className="text-slate-300 font-bold tracking-wider">LIVE TRAFFIC</span>
        </div>
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 text-[13px]">
        {logs.map(log => (
          <div key={log.id} className="flex items-center gap-4 py-1 border-b border-white/5 hover:bg-white/5 px-2 rounded">
            <span className="text-slate-500 w-16 shrink-0">{log.timestamp}</span>
            <span className={`w-12 font-bold ${log.status === 429 ? 'text-brand-red' : 'text-brand-green'}`}>{log.status}</span>
            <span className="text-brand-lavender w-12 shrink-0">{log.method}</span>
            <span className="text-slate-300 w-32 truncate">{log.path}</span>
            <span className="text-slate-400 w-32 shrink-0">{log.clientIp}</span>
            <span className="text-slate-500 ml-auto">{log.latency}ms</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-slate-500 text-center mt-10">Awaiting traffic...</div>
        )}
      </div>
    </div>
  );
}
