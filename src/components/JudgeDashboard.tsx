import { useMemo, useState, useEffect } from 'react';
import { ArrowDownUp, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, Weights, Theme, THEMES, compositeScore, JudgeAction, SortField, Paginated } from '@/types';
import ProjectCard from './ProjectCard';

interface JudgeDashboardProps {
  projects: Project[];
  weights: Weights;
  onAction: (id: string, action: Exclude<JudgeAction, null>) => void;
}

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'composite', label: 'Composite Score' },
  { value: 'technical', label: 'Technical Score' },
  { value: 'design', label: 'Design Score' },
  { value: 'presentation', label: 'Presentation Score' },
  { value: 'newest', label: 'Newest' },
];

export default function JudgeDashboard({ projects, weights, onAction }: JudgeDashboardProps) {
  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState<Theme | 'all'>('all');
  const [clusterFilter, setClusterFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('composite');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);

  const clusters = useMemo(
    () => Array.from(new Set(projects.map((p) => p.clusterGroup))).sort(),
    [projects],
  );

  const filtered = useMemo(() => {
    let list = projects;
    if (themeFilter !== 'all') list = list.filter((p) => p.theme === themeFilter);
    if (clusterFilter !== 'all') list = list.filter((p) => p.clusterGroup === clusterFilter);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((p) => p.teamName.toLowerCase().includes(q));
    }
    const withScores = list.map((p) => ({ p, score: compositeScore(p, weights) }));
    withScores.sort((a, b) => {
      let diff: number;
      switch (sortField) {
        case 'technical': diff = a.p.technicalScore - b.p.technicalScore; break;
        case 'design': diff = a.p.designScore - b.p.designScore; break;
        case 'presentation': diff = a.p.presentationScore - b.p.presentationScore; break;
        case 'newest': diff = a.p.createdAt - b.p.createdAt; break;
        default: diff = a.score - b.score;
      }
      return sortDesc ? -diff : diff;
    });
    return withScores;
  }, [projects, weights, themeFilter, clusterFilter, search, sortField, sortDesc]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, themeFilter, clusterFilter, sortField, sortDesc]);

  const paginated: Paginated<(typeof filtered)[number]> = useMemo(() => {
    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    const data = filtered.slice(start, start + PAGE_SIZE);
    return { data, total, page, pageSize: PAGE_SIZE };
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(paginated.total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Judge Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Showing {paginated.data.length} of {paginated.total} submission{paginated.total === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team name…"
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 py-1.5 pl-8 pr-3 text-sm text-white placeholder-slate-500 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <FilterSelect
          icon={Filter}
          value={themeFilter}
          onChange={(v) => setThemeFilter(v as Theme | 'all')}
          options={[{ value: 'all', label: 'All themes' }, ...THEMES.map((t) => ({ value: t, label: t }))]}
        />

        <FilterSelect
          icon={Filter}
          value={clusterFilter}
          onChange={(v) => setClusterFilter(v)}
          options={[{ value: 'all', label: 'All clusters' }, ...clusters.map((c) => ({ value: c, label: c }))]}
        />

        <FilterSelect
          icon={ArrowDownUp}
          value={sortField}
          onChange={(v) => setSortField(v as SortField)}
          options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />

        <button
          onClick={() => setSortDesc((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
          title="Toggle sort direction"
        >
          <ArrowDownUp className="h-3.5 w-3.5" />
          {sortDesc ? 'Desc' : 'Asc'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginated.data.map(({ p }, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            weights={weights}
            rank={(page - 1) * PAGE_SIZE + i + 1}
            onAction={onAction}
          />
        ))}
        {paginated.data.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-400">
            No projects match your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <PageBtn disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </PageBtn>
            {pageNumbers(page, totalPages).map((n, i) =>
              n === '…' ? (
                <span key={`gap-${i}`} className="px-2 text-slate-600">…</span>
              ) : (
                <PageBtn key={n} active={n === page} onClick={() => setPage(n)}>
                  {n}
                </PageBtn>
              ),
            )}
            <PageBtn disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <ChevronRight className="h-4 w-4" />
            </PageBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  icon: Icon, value, onChange, options,
}: {
  icon: typeof Filter;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm text-slate-200 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function PageBtn({
  children, active, disabled, onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm transition ${
        active
          ? 'bg-teal-500 font-semibold text-slate-900'
          : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      {children}
    </button>
  );
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}
