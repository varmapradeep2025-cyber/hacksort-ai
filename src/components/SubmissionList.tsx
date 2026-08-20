import { useMemo, useState, useEffect } from 'react';
import { ListChecks, Clock, CheckCircle2, Eye } from 'lucide-react';
import { Project, Weights, compositeScore, SubmissionStatus, Paginated } from '@/types';

interface SubmissionListProps {
  projects: Project[];
  weights: Weights;
}

const PAGE_SIZE = 10;

const STATUS_TABS: { key: SubmissionStatus | 'all'; label: string; icon: typeof Clock }[] = [
  { key: 'all', label: 'All', icon: ListChecks },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'scored', label: 'Scored', icon: CheckCircle2 },
  { key: 'reviewed', label: 'Reviewed', icon: Eye },
];

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  scored: 'bg-teal-500/15 text-teal-300 ring-teal-500/30',
  reviewed: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30',
};

export default function SubmissionList({ projects, weights }: SubmissionListProps) {
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const list = statusFilter === 'all' ? projects : projects.filter((p) => p.status === statusFilter);
    return list.map((p) => ({ p, score: compositeScore(p, weights), loading: p.status === 'pending' }));
  }, [projects, weights, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const paginated: Paginated<(typeof filtered)[number]> = useMemo(() => {
    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    return { data: filtered.slice(start, start + PAGE_SIZE), total, page, pageSize: PAGE_SIZE };
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(paginated.total / PAGE_SIZE));
  const counts = useMemo(() => {
    const c = { all: projects.length, pending: 0, scored: 0, reviewed: 0 };
    projects.forEach((p) => { c[p.status]++; });
    return c;
  }, [projects]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-teal-400" />
        <h2 className="text-xl font-semibold text-white">Submission Management</h2>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-sm">
        {STATUS_TABS.map(({ key, label, icon: Icon }) => {
          const active = statusFilter === key;
          const count = counts[key as keyof typeof counts];
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-teal-500 text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-slate-900/20' : 'bg-slate-800'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2.5 text-left">Team</th>
              <th className="hidden px-4 py-2.5 text-left sm:table-cell">Theme</th>
              <th className="hidden px-4 py-2.5 text-left md:table-cell">Cluster</th>
              <th className="px-4 py-2.5 text-left">Status</th>
              <th className="px-4 py-2.5 text-right">Composite</th>
            </tr>
          </thead>
          <tbody>
            {paginated.data.map(({ p, score, loading }) => (
              <tr key={p.id} className="border-t border-slate-800 transition-colors hover:bg-slate-800/40">
                <td className="px-4 py-2.5 font-medium text-slate-200">{p.teamName}</td>
                <td className="hidden px-4 py-2.5 text-slate-400 sm:table-cell">{p.theme}</td>
                <td className="hidden px-4 py-2.5 text-slate-400 md:table-cell">{p.clusterGroup}</td>
                <td className="px-4 py-2.5">
                  {loading ? (
                    <SkeletonPill />
                  ) : (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {loading ? (
                    <SkeletonScore />
                  ) : (
                    <span className="font-semibold text-teal-300">{score.toFixed(2)}</span>
                  )}
                </td>
              </tr>
            ))}
            {paginated.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  No submissions with this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing {paginated.data.length} of {paginated.total}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-2 text-xs text-slate-400">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonPill() {
  return (
    <span className="inline-flex h-5 w-16 animate-pulse rounded-full bg-slate-700/60" />
  );
}

function SkeletonScore() {
  return (
    <span className="ml-auto block h-4 w-10 animate-pulse rounded bg-slate-700/60" />
  );
}
