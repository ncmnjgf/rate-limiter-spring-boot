import { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';

interface Client {
  id: string;
  ip: string;
  plan: string;
  tokensLeft: number;
  capacity: number;
  reqMin: number;
  blockCount: number;
  status: 'Active' | 'Throttled' | 'Blocked';
}

const mockClients: Client[] = [
  { id: '1', ip: '192.168.1.101', plan: 'Free', tokensLeft: 2, capacity: 10, reqMin: 45, blockCount: 12, status: 'Throttled' },
  { id: '2', ip: '10.0.0.52', plan: 'Pro', tokensLeft: 85, capacity: 100, reqMin: 12, blockCount: 0, status: 'Active' },
  { id: '3', ip: '172.16.0.4', plan: 'Free', tokensLeft: 0, capacity: 10, reqMin: 120, blockCount: 304, status: 'Blocked' },
  { id: '4', ip: '192.168.1.200', plan: 'Enterprise', tokensLeft: 450, capacity: 1000, reqMin: 210, blockCount: 0, status: 'Active' },
];

export function ClientsTable() {
  const [filter, setFilter] = useState<'All' | 'Throttled' | 'Blocked'>('All');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filtered = mockClients.filter(c => filter === 'All' || c.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-heading font-bold text-lg">Active Clients</h3>
        
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search IP or Key..." 
              className="bg-black/50 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm font-data w-64 focus:outline-none focus:border-brand-cyan/50"
            />
          </div>
          
          <div className="flex glass rounded-full overflow-hidden p-1 text-sm font-data">
            {['All', 'Throttled', 'Blocked'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 rounded-full transition-all ${filter === f ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-white/5">
        <table className="w-full text-left font-data text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Client IP</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Plan</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs w-48">Tokens Left</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Req/Min</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">429 Count</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(client => (
              <tr 
                key={client.id} 
                className="hover:bg-white/5 cursor-pointer transition-colors group"
                onClick={() => setSelectedClient(client)}
              >
                <td className="px-6 py-4 font-bold">{client.ip}</td>
                <td className="px-6 py-4"><span className="bg-white/10 px-2 py-0.5 rounded text-xs">{client.plan}</span></td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <span className="w-8">{client.tokensLeft}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${client.tokensLeft === 0 ? 'bg-brand-red' : client.tokensLeft < (client.capacity / 2) ? 'bg-brand-amber' : 'bg-brand-green'}`} 
                      style={{ width: `${Math.max(0, (client.tokensLeft / client.capacity) * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">{client.reqMin}</td>
                <td className={`px-6 py-4 ${client.blockCount > 0 ? 'text-brand-red font-bold' : 'text-slate-500'}`}>{client.blockCount}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full border 
                    ${client.status === 'Active' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 
                      client.status === 'Throttled' ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' : 
                      'bg-brand-red/10 text-brand-red border-brand-red/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Active' ? 'bg-brand-green' : client.status === 'Throttled' ? 'bg-brand-amber' : 'bg-brand-red'}`} />
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedClient && (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#0A0D30] border-l border-white/10 shadow-2xl z-50 flex flex-col font-data animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
            <div>
              <h3 className="font-heading font-black text-xl text-white">{selectedClient.ip}</h3>
              <span className="text-slate-400 text-sm">Client Details</span>
            </div>
            <button onClick={() => setSelectedClient(null)} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full">
              ✕
            </button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Plan & Quota</span>
              <div className="glass p-4 rounded-xl flex items-center justify-between border-t border-white/5 mt-2">
                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded text-xs">{selectedClient.plan}</span>
                <span className="text-brand-cyan">{selectedClient.capacity} tokens / window</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Live Usage</span>
              <div className="glass p-4 text-center rounded-xl border-t border-white/5 mt-2 flex flex-col gap-2">
                 <span className="text-4xl font-heading font-black text-white">{selectedClient.tokensLeft}</span>
                 <span className="text-xs text-slate-400">Tokens Remaining</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Actions</span>
              <div className="flex flex-col gap-2 mt-2">
                <button className="w-full py-3 rounded-lg bg-brand-amber/10 text-brand-amber font-bold border border-brand-amber/20 hover:bg-brand-amber/20 transition-colors">
                  Throttle Manually
                </button>
                <button className="w-full py-3 rounded-lg bg-brand-red/10 text-brand-red font-bold border border-brand-red/20 hover:bg-brand-red/20 transition-colors">
                  Block Globally
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSelectedClient(null)} />
      )}
    </div>
  );
}
