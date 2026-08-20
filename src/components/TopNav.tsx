import { Users, Gavel, SlidersHorizontal, Boxes, Sparkles } from 'lucide-react';
import { ViewKey } from '@/types';

interface TopNavProps {
  view: ViewKey;
  onChange: (v: ViewKey) => void;
}

const TABS: { key: ViewKey; label: string; icon: typeof Users }[] = [
  { key: 'participant', label: 'Participant', icon: Users },
  { key: 'judge', label: 'Judge', icon: Gavel },
  { key: 'organizer', label: 'Organizer', icon: SlidersHorizontal },
  { key: 'clusters', label: 'Clusters', icon: Sparkles },
];

export default function TopNav({ view, onChange }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 ring-1 ring-teal-400/30">
            <Boxes className="h-5 w-5 text-teal-400" />
          </div>
          <div className="leading-tight">
            <span className="block text-base font-semibold tracking-tight">HackSort</span>
            <span className="block text-[11px] text-slate-400">AI Triage Dashboard</span>
          </div>
        </div>

        <nav className="flex items-center gap-1 rounded-xl bg-slate-800/70 p-1">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => onChange(key)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 sm:px-4 ${
                  active
                    ? 'bg-teal-500 text-slate-900 shadow-sm shadow-teal-500/30'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
