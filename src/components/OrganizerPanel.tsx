import { useMemo } from 'react';
import { SlidersHorizontal, BarChart3, Layers, TrendingUp } from 'lucide-react';
import { Project, Weights, compositeScore } from '@/types';
import SubmissionList from './SubmissionList';

interface OrganizerPanelProps {
  projects: Project[];
  weights: Weights;
  onWeights: (w: Weights) => void;
}

const EQUAL: Weights = { technical: 34, design: 33, presentation: 33 };

export default function OrganizerPanel({ projects, weights, onWeights }: OrganizerPanelProps) {
  const sum = weights.technical + weights.design + weights.presentation;

  function setW(key: keyof Weights, val: number) {
    const clamped = Math.max(0, Math.min(100, val));
    const next: Weights = { ...weights, [key]: clamped };
    const total = next.technical + next.design + next.presentation;
    if (total !== 100 && total > 0) {
      const factor = 100 / total;
      next.technical = Math.round(next.technical * factor);
      next.design = Math.round(next.design * factor);
      next.presentation = 100 - next.technical - next.design;
    }
    onWeights(next);
  }

  const preview = useMemo(() => {
    return projects
      .map((p) => ({ p, score: compositeScore(p, weights) }))
      .sort((a, b) => b.score - a.score);
  }, [projects, weights]);

  const themesCovered = new Set(projects.map((p) => p.theme)).size;
  const avgComposite =
    Math.round(
      (projects.reduce((acc, p) => acc + compositeScore(p, weights), 0) / projects.length) * 100,
    ) / 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Organizer Control Panel</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tune scoring weights and review AI-clustered submissions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Layers} label="Total Submissions" value={projects.length} />
        <Stat icon={BarChart3} label="Themes Covered" value={themesCovered} />
        <Stat icon={TrendingUp} label="Avg Composite" value={avgComposite.toFixed(2)} />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-teal-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Scoring Weights
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium ${
                sum === 100 ? 'text-teal-400' : 'text-amber-400'
              }`}
            >
              Sum: {sum}%
            </span>
            <button
              onClick={() => onWeights(EQUAL)}
              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-800"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Slider
            label="Technical"
            value={weights.technical}
            color="accent-teal"
            onChange={(v) => setW('technical', v)}
          />
          <Slider
            label="Design / UX"
            value={weights.design}
            color="accent-sky"
            onChange={(v) => setW('design', v)}
          />
          <Slider
            label="Presentation"
            value={weights.presentation}
            color="accent-violet"
            onChange={(v) => setW('presentation', v)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Live Preview Ranking
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Team</th>
                <th className="hidden px-3 py-2 text-left sm:table-cell">Theme</th>
                <th className="px-3 py-2 text-right">Composite</th>
              </tr>
            </thead>
            <tbody>
              {preview.map(({ p, score }, i) => (
                <tr
                  key={p.id}
                  className="border-t border-slate-800 transition-colors hover:bg-slate-800/40"
                >
                  <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-slate-200">{p.teamName}</td>
                  <td className="hidden px-3 py-2 text-slate-400 sm:table-cell">{p.theme}</td>
                  <td className="px-3 py-2 text-right font-semibold text-teal-300">
                    {score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6">
        <SubmissionList projects={projects} weights={weights} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4 text-teal-400" />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Slider({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value: number;
  color: 'accent-teal' | 'accent-sky' | 'accent-violet';
  onChange: (v: number) => void;
}) {
  const accent =
    color === 'accent-teal'
      ? 'accent-teal-500'
      : color === 'accent-sky'
        ? 'accent-sky-500'
        : 'accent-violet-500';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 ${accent}`}
      />
    </div>
  );
}
