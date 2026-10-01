import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Users, LayoutDashboard, Settings, Activity } from 'lucide-react';
import { SparklineChart } from '@/components/ui/Chart';
import { LiveLogsTerminal } from '@/components/ui/LiveLogs';
import { ClientsTable } from '@/components/ui/ClientsTable';
import { RulesList } from '@/components/ui/RulesList';

type Tab = 'Overview' | 'Clients' | 'Rules' | 'Live Logs';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  return (
    <div className="flex h-screen bg-[#060822] text-slate-300 font-body overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0A0D30] flex flex-col">
        <Link to="/" className="p-6 font-heading font-black text-xl flex items-center gap-2 text-white hover:text-brand-cyan transition-colors">
          <ShieldAlert className="text-brand-cyan" />
          RateLimiter
        </Link>
        
        <nav className="flex-1 px-4 flex flex-col gap-2 mt-4 text-sm font-medium">
          <button onClick={() => setActiveTab('Overview')} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'Overview' ? 'bg-white/5 text-brand-cyan' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={18} /> Overview
          </button>
          <button onClick={() => setActiveTab('Clients')} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'Clients' ? 'bg-white/5 text-brand-cyan' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Users size={18} /> Clients
          </button>
          <button onClick={() => setActiveTab('Rules')} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'Rules' ? 'bg-white/5 text-brand-cyan' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Settings size={18} /> Rules
          </button>
          <button onClick={() => setActiveTab('Live Logs')} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'Live Logs' ? 'bg-white/5 text-brand-cyan' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Activity size={18} /> Live Logs
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-white/5 flex justify-between items-center px-8 bg-[#0A0D30]/80 glass sticky top-0 z-10 shrink-0">
          <h2 className="font-heading font-bold text-lg text-white">Dashboard {activeTab}</h2>
          <div className="flex items-center gap-4 text-sm font-data">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" /> Live Mode
            </span>
            <div className="w-8 h-8 rounded-full bg-brand-lavender/20 flex items-center justify-center text-brand-lavender font-bold">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 flex flex-col gap-6">
          {activeTab === 'Overview' && (
            <>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="glass p-6 rounded-xl flex flex-col gap-2">
                  <span className="text-xs font-data text-slate-400 font-bold uppercase tracking-wider">Total Requests</span>
                  <span className="text-3xl font-heading font-black text-white">124,592</span>
                </div>
                <div className="glass p-6 rounded-xl flex flex-col gap-2">
                  <span className="text-xs font-data text-slate-400 font-bold uppercase tracking-wider">Allowed</span>
                  <span className="text-3xl font-heading font-black text-brand-green">99.1%</span>
                </div>
                <div className="glass p-6 rounded-xl flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red" />
                  <span className="text-xs font-data text-slate-400 font-bold uppercase tracking-wider">Blocked (429)</span>
                  <span className="text-3xl font-heading font-black text-red-400">1,123</span>
                </div>
                <div className="glass p-6 rounded-xl flex flex-col gap-2">
                  <span className="text-xs font-data text-slate-400 font-bold uppercase tracking-wider">Avg Usage</span>
                  <span className="text-3xl font-heading font-black text-brand-cyan">74%</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 pb-12 mt-2">
                {/* Main Chart */}
                <div className="glass-light p-6 rounded-[2px_2px_32px_2px] flex-1 min-h-[300px] flex flex-col">
                  <h3 className="font-heading font-bold mb-6">Traffic Analysis</h3>
                  <div className="flex-1 w-full">
                    <SparklineChart 
                      series={[
                        { id: 'allowed', color: '#4DFFB0', data: [10, 40, 30, 70, 50, 90, 80, 120, 100, 150] },
                        { id: 'blocked', color: '#FF5A47', data: [0, 5, 2, 10, 5, 20, 10, 40, 20, 50] }
                      ]} 
                      height={250} 
                    />
                  </div>
                </div>
                
                {/* Live Logs Mini */}
                <div className="flex-1">
                  <LiveLogsTerminal />
                </div>
              </div>
            </>
          )}

          {activeTab === 'Clients' && (
            <ClientsTable />
          )}

          {activeTab === 'Rules' && (
            <RulesList />
          )}

          {activeTab === 'Live Logs' && (
            <div className="w-full flex-1 min-h-[600px] flex">
              <LiveLogsTerminal />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
