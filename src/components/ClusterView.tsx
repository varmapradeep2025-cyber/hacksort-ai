import { Boxes } from 'lucide-react';
import { Project } from '@/types';

interface ClusterViewProps {
  projects: Project[];
}

export default function ClusterView({ projects }: ClusterViewProps) {
  const clusters = new Map<string, Project[]>();
  for (const p of projects) {
    const arr = clusters.get(p.clusterGroup) ?? [];
    arr.push(p);
    clusters.set(p.clusterGroup, arr);
  }
  const groups = Array.from(clusters.entries()).sort((a, b) => b[1].length - a[1].length);

  const palette: Record<string, string> = {
    'Cluster A': 'from-teal-500/15 to-teal-500/5 ring-teal-500/30',
    'Cluster B': 'from-sky-500/15 to-sky-500/5 ring-sky-500/30',
    'Cluster C': 'from-violet-500/15 to-violet-500/5 ring-violet-500/30',
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Boxes className="h-4 w-4 text-teal-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Similarity Clusters
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(([name, members]) => (
          <div
            key={name}
            className={`rounded-xl border border-slate-800 bg-gradient-to-b ${palette[name] ?? 'from-slate-800/40 to-slate-900 ring-slate-700'} p-4 ring-1`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{name}</span>
              <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-slate-700">
                {members.length} project{members.length === 1 ? '' : 's'}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-md bg-slate-900/40 px-2.5 py-1.5 text-xs">
                  <span className="text-slate-200">{m.teamName}</span>
                  <span className="text-slate-500">{m.theme}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
