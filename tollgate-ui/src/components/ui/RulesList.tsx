import { useState } from 'react';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  pattern: string;
  algorithm: 'Token Bucket' | 'Fixed Window';
  capacity: number;
  refillRate: number;
  scope: 'Global' | 'IP' | 'Key';
  enabled: boolean;
}

const mockRules: Rule[] = [
  { id: '1', name: 'Standard API Limit', pattern: '/api/*', algorithm: 'Token Bucket', capacity: 100, refillRate: 10, scope: 'IP', enabled: true },
  { id: '2', name: 'Heavy Video Upload', pattern: '/api/upload', algorithm: 'Token Bucket', capacity: 5, refillRate: 1, scope: 'IP', enabled: true },
  { id: '3', name: 'Global Rate Limiter', pattern: '*', algorithm: 'Fixed Window', capacity: 10000, refillRate: 10000, scope: 'Global', enabled: false },
];

export function RulesList() {
  const [rules, setRules] = useState<Rule[]>(mockRules);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-heading font-bold text-lg">Active Limiting Rules</h3>
        
        <button className="bg-brand-cyan text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-colors text-sm">
          <Plus size={16} /> New Rule
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {rules.map(rule => (
          <div key={rule.id} className={`glass p-4 rounded-xl border flex items-center gap-6 transition-all ${rule.enabled ? 'border-brand-cyan/20 bg-brand-cyan/5' : 'border-white/5 opacity-60'}`}>
            <button 
              onClick={() => toggleRule(rule.id)}
              className={`p-2 rounded-full transition-colors ${rule.enabled ? 'bg-brand-cyan shadow-[0_0_15px_rgba(77,255,176,0.5)] text-black' : 'bg-white/10 text-slate-400'}`}
            >
              <Power size={18} />
            </button>
            
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white text-base">{rule.name}</span>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-brand-lavender font-data">{rule.scope}</span>
              </div>
              <span className="text-sm text-slate-400 font-data">Matches: <code className="text-brand-amber">{rule.pattern}</code></span>
            </div>

            <div className="flex flex-col items-end gap-1 font-data mr-8">
              <span className="text-sm text-white font-bold">{rule.algorithm}</span>
              <span className="text-xs text-slate-400">Cap: {rule.capacity} • Refill: {rule.refillRate}/sec</span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setEditingRule(rule)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => setRules(rules.filter(r => r.id !== rule.id))}
                className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-data">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingRule(null)} />
          <div className="relative bg-[#0A0D30] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <h3 className="font-heading font-black text-xl text-white">Edit Rule</h3>
            
            <div className="flex flex-col gap-4 text-sm">
              <label className="flex flex-col gap-2 text-slate-400">
                Rule Name
                <input type="text" defaultValue={editingRule.name} className="bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-cyan/50" />
              </label>
              <label className="flex flex-col gap-2 text-slate-400">
                Match Pattern
                <input type="text" defaultValue={editingRule.pattern} className="bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-brand-amber font-mono focus:outline-none focus:border-brand-cyan/50" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-slate-400">
                  Capacity
                  <input type="number" defaultValue={editingRule.capacity} className="bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-cyan/50" />
                </label>
                <label className="flex flex-col gap-2 text-slate-400">
                  Refill Rate (/sec)
                  <input type="number" defaultValue={editingRule.refillRate} className="bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-cyan/50" />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setEditingRule(null)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => setEditingRule(null)} className="px-4 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-white transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
