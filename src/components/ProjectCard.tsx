import { useState } from 'react';
import { Star, Flag, X, ChevronDown, Lightbulb } from 'lucide-react';
import { Project, Weights, compositeScore, JudgeAction } from '@/types';

interface ProjectCardProps {
  project: Project;
  weights: Weights;
  rank: number;
  onAction: (id: string, action: Exclude<JudgeAction, null>) => void;
}

const THEME_STYLES: Record<string, string> = {
  'Crop Rotation': 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  'Farming/Agriculture': 'bg-green-500/15 text-green-300 ring-green-500/30',
  'Hospital Management': 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  'Student Attendance System': 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  'Open Innovation': 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  'Fake Documents Detection': 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
};

export default function ProjectCard({ project, weights, rank, onAction }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const composite = compositeScore(project, weights);
  const themeCls = THEME_STYLES[project.theme] ?? 'bg-slate-600/20 text-slate-300 ring-slate-500/30';

  const actionBtn = (kind: Exclude<JudgeAction, null>, Icon: typeof Star, activeCls: string, label: string) => {
    const active = project.action === kind;
    return (
      <button
        onClick={() => onAction(project.id, kind)}
        title={label}
        aria-label={label}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
          active
            ? activeCls
            : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <div
      className={`rounded-xl border bg-slate-900 shadow-sm transition-all duration-200 hover:shadow-md ${
        project.action === 'reject' ? 'border-red-900/50 opacity-75' : 'border-slate-800'
      }`}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold text-slate-400">
          {rank}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-white">{project.teamName}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${themeCls}`}>
              {project.theme}
            </span>
            {project.simplicityLane && (
              <span className="flex items-center gap-1 rounded-full bg-teal-500/15 px-2 py-0.5 text-[11px] font-medium text-teal-300 ring-1 ring-teal-500/30">
                <Lightbulb className="h-3 w-3" />
                Simplicity Lane
              </span>
            )}
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400 ring-1 ring-slate-700">
              {project.clusterGroup} — {project.clusterSize} similar
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Score label="Technical" value={project.technicalScore} />
            <Score label="Design / UX" value={project.designScore} />
            <Score label="Presentation" value={project.presentationScore} />
            <Score label="Composite" value={composite} highlight />
          </div>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Toggle AI notes"
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 px-4 py-3">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
            {project.aiNotes}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-slate-800 px-4 py-2.5">
        {actionBtn('star', Star, 'border-amber-500/40 bg-amber-500/15 text-amber-300', 'Star')}
        {actionBtn('flag', Flag, 'border-orange-500/40 bg-orange-500/15 text-orange-300', 'Flag')}
        {actionBtn('reject', X, 'border-red-500/40 bg-red-500/15 text-red-300', 'Reject')}
      </div>
    </div>
  );
}

function Score({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg px-2.5 py-2 ${
        highlight ? 'bg-teal-500/10 ring-1 ring-teal-500/30' : 'bg-slate-800/60'
      }`}
    >
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-sm font-semibold ${highlight ? 'text-teal-300' : 'text-slate-200'}`}>
        {value.toFixed(1)}
      </div>
    </div>
  );
}


