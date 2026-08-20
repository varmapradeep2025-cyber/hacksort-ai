import { useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis as BarX,
} from 'recharts';
import { Sparkles, Boxes, Layers, Maximize2, Percent, Compass, ChevronDown, Filter } from 'lucide-react';
import {
  ClusterProject, buildClusterGroups, avgSimilarity, getClusterConfig, CLUSTER_PALETTE,
} from '@/clusterData';
import { Theme } from '@/types';

interface ClusterAnalysisProps {
  projects: ClusterProject[];
}

interface TooltipPayloadEntry {
  payload: ClusterProject;
}

const MAX_VISIBLE_PILLS = 5;
const MAX_CLUSTERS_CHART = 8;

export default function ClusterAnalysis({ projects }: ClusterAnalysisProps) {
  const [clusterFilter, setClusterFilter] = useState<string>('all');

  const allGroups = useMemo(() => buildClusterGroups(projects), [projects]);
  const realClustersAll = allGroups.filter((g) => g.id !== 'OUT');
  const outliersAll = projects.filter((p) => p.isOutlier);

  const visibleProjects = useMemo(
    () => (clusterFilter === 'all' ? projects : projects.filter((p) => p.clusterId === clusterFilter)),
    [projects, clusterFilter],
  );

  const groups = useMemo(() => buildClusterGroups(visibleProjects), [visibleProjects]);
  const realClusters = groups.filter((g) => g.id !== 'OUT');
  const outliers = visibleProjects.filter((p) => p.isOutlier);

  const totalClusters = realClustersAll.length;
  const largestCluster = Math.max(0, ...realClustersAll.map((g) => g.members.length));
  const avgSimAll = realClustersAll.length
    ? Math.round(realClustersAll.reduce((a, g) => a + avgSimilarity(g.members), 0) / realClustersAll.length)
    : 0;
  const outlierCount = outliersAll.length;

  const themeDist = useMemo(() => buildThemeDistribution(realClustersAll), [realClustersAll]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/30">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Cluster Analysis</h2>
            <p className="text-sm text-slate-400">
              How AI grouped {projects.length} submissions based on embedding similarity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
            className="bg-transparent text-sm text-slate-200 focus:outline-none"
          >
            <option value="all" className="bg-slate-800">All clusters</option>
            {CLUSTER_PALETTE.filter((c) => c.id !== 'OUT').map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>
            ))}
            <option value="OUT" className="bg-slate-800">Outliers</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ClusterCards groups={groups} outliers={outliers} clusterFilter={clusterFilter} />
        <ScatterPanel projects={visibleProjects} groups={groups} />
      </div>

      <AnalyticsSummary
        totalClusters={totalClusters}
        largestCluster={largestCluster}
        avgSimAll={avgSimAll}
        outlierCount={outlierCount}
      />

      <ThemeDistributionChart data={themeDist} />
    </section>
  );
}

function ClusterCards({
  groups, outliers, clusterFilter,
}: {
  groups: ReturnType<typeof buildClusterGroups>;
  outliers: ClusterProject[];
  clusterFilter: string;
}) {
  const real = groups.filter((g) => g.id !== 'OUT');
  return (
    <div className="space-y-3">
      <SectionHeader icon={Boxes} title="Grouped Cluster Cards" />
      <div className="space-y-3">
        {real.map((g) => (
          <ClusterCard key={g.id} group={g} />
        ))}
        {real.length === 0 && clusterFilter !== 'all' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
            No clusters in this filter.
          </div>
        )}
      </div>

      {outliers.length > 0 && (
        <div className="rounded-xl border border-teal-500/30 bg-gradient-to-b from-teal-500/10 to-teal-500/5 p-4 ring-1 ring-teal-500/20 shadow-sm">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-teal-300" />
            <span className="text-sm font-semibold text-white">Most Original Submissions</span>
          </div>
          <p className="mt-1 text-xs text-teal-200/70">
            These projects stood apart from every cluster — high originality, not a weakness.
          </p>
          <OutlierPills outliers={outliers} />
        </div>
      )}
    </div>
  );
}

function ClusterCard({ group }: { group: ReturnType<typeof buildClusterGroups>[number] }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = getClusterConfig(group.id);
  const visible = expanded ? group.members : group.members.slice(0, MAX_VISIBLE_PILLS);
  const hidden = group.members.length - MAX_VISIBLE_PILLS;

  return (
    <div
      className={`rounded-xl border border-slate-800 ${cfg.tint} ring-1 ${cfg.ring} p-4 shadow-sm`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
          <span className="text-sm font-semibold text-white">{group.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-slate-300 ring-1 ring-slate-700">
            {group.members.length} projects
          </span>
          <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-slate-300 ring-1 ring-slate-700">
            {avgSimilarity(group.members)}% avg sim
          </span>
        </div>
      </div>
      <div className="mt-1 text-xs text-slate-400">
        Dominant theme: {dominantTheme(group.members)}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {visible.map((m) => (
          <span
            key={m.id}
            className="rounded-md bg-slate-900/60 px-2 py-1 text-xs text-slate-200 ring-1 ring-slate-700"
          >
            {m.teamName} — <span style={{ color: group.color }}>{m.similarityScore}%</span>
          </span>
        ))}
        {hidden > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          >
            {expanded ? 'Show less' : `+${hidden} more`}
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}

function OutlierPills({ outliers }: { outliers: ClusterProject[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? outliers : outliers.slice(0, MAX_VISIBLE_PILLS);
  const hidden = outliers.length - MAX_VISIBLE_PILLS;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {visible.map((m) => (
        <span
          key={m.id}
          className="rounded-md bg-slate-900/60 px-2 py-1 text-xs text-slate-200 ring-1 ring-teal-500/30"
        >
          {m.teamName} — <span className="text-teal-300">{m.similarityScore}%</span>
        </span>
      ))}
      {hidden > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 rounded-md border border-teal-500/30 px-2 py-1 text-xs text-teal-300 transition hover:bg-teal-500/10"
        >
          {expanded ? 'Show less' : `+${hidden} more`}
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}

function ScatterPanel({
  projects, groups,
}: {
  projects: ClusterProject[];
  groups: ReturnType<typeof buildClusterGroups>;
}) {
  return (
    <div className="space-y-3">
      <SectionHeader icon={Maximize2} title="Embedding Scatter Plot" />
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top: 12, right: 16, bottom: 12, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="x"
              name="Dim 1"
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#334155"
              label={{ value: 'Dimension 1', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Dim 2"
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#334155"
              label={{ value: 'Dimension 2', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            {/* Smaller range for 50+ points; opacity on Scatter keeps overlaps visible */}
            <ZAxis type="number" dataKey="compositeScore" range={[30, 180]} name="Composite" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
              content={<ScatterTip />}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: '#cbd5e1' }}
              iconType="circle"
            />
            {groups.map((g) => (
              <Scatter
                key={g.id}
                name={g.id === 'OUT' ? 'Outliers' : g.name}
                data={projects.filter((p) => p.clusterId === g.id)}
                fill={g.color}
                fillOpacity={0.7}
                stroke={g.color}
                strokeOpacity={0.4}
                strokeWidth={0.5}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <p className="mt-2 text-center text-xs text-slate-500">
          Point size represents composite score. Opacity keeps overlapping submissions visible.
          {projects.length > 40 && ' For full zoom/pan, integrate react-zoom-pan-pinch around this chart container.'}
        </p>
      </div>
    </div>
  );
}

function ScatterTip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  const cfg = getClusterConfig(p.clusterId);
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-white">{p.teamName}</div>
      <div className="mt-1 space-y-0.5 text-slate-400">
        <div>Theme: <span className="text-slate-200">{p.theme}</span></div>
        <div>Cluster: <span style={{ color: cfg.color }}>{p.clusterName}</span></div>
        <div>Composite: <span className="text-teal-300">{p.compositeScore.toFixed(1)}</span></div>
        <div>Similarity: <span className="text-slate-200">{p.similarityScore}%</span></div>
      </div>
    </div>
  );
}

function AnalyticsSummary({
  totalClusters, largestCluster, avgSimAll, outlierCount,
}: { totalClusters: number; largestCluster: number; avgSimAll: number; outlierCount: number }) {
  return (
    <div>
      <SectionHeader icon={Layers} title="Analytics Summary" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Boxes} label="Total Clusters" value={totalClusters} />
        <SummaryCard icon={Maximize2} label="Largest Cluster Size" value={largestCluster} />
        <SummaryCard icon={Percent} label="Avg Similarity (All)" value={`${avgSimAll}%`} />
        <SummaryCard icon={Compass} label="Outlier Count" value={outlierCount} />
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Boxes; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4 text-indigo-400" />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function ThemeDistributionChart({
  data,
}: { data: { cluster: string; size: number; [theme: string]: number | string }[] }) {
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(
    () => [...data].sort((a, b) => (b.size as number) - (a.size as number)),
    [data],
  );
  const truncated = showAll ? sorted : sorted.slice(0, MAX_CLUSTERS_CHART);
  const hiddenCount = sorted.length - MAX_CLUSTERS_CHART;

  const themes = useMemo(() => {
    const set = new Set<string>();
    truncated.forEach((d) =>
      Object.keys(d).forEach((k) => k !== 'cluster' && k !== 'size' && set.add(k)),
    );
    return Array.from(set);
  }, [truncated]);

  const themeColors: Record<string, string> = {
    'Crop Rotation': '#10b981',
    'Farming/Agriculture': '#84cc16',
    'Hospital Management': '#0ea5e9',
    'Student Attendance System': '#8b5cf6',
    'Open Innovation': '#f59e0b',
    'Fake Documents Detection': '#f43f5e',
  };

  return (
    <div>
      <SectionHeader icon={Layers} title="Theme Distribution Within Clusters" />
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
        <ResponsiveContainer width="100%" height={Math.max(220, truncated.length * 36)}>
          <BarChart
            data={truncated}
            layout="vertical"
            margin={{ top: 8, right: 12, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <BarX
              type="category"
              dataKey="cluster"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              stroke="#334155"
              width={90}
            />
            <YAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              stroke="#334155"
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip
              cursor={{ fill: '#1e293b66' }}
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 12,
                color: '#e2e8f0',
              }}
              formatter={(value, name) => [`${value}%`, String(name)]}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#cbd5e1' }} iconType="circle" />
            {themes.map((t) => (
              <Bar
                key={t}
                dataKey={t}
                stackId="a"
                fill={themeColors[t] ?? '#64748b'}
                radius={[0, 3, 3, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        {hiddenCount > 0 && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
            >
              {showAll ? 'Show top 8 clusters' : `View all ${sorted.length} clusters (${hiddenCount} hidden)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Boxes; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-indigo-400" />
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{title}</h3>
    </div>
  );
}

function dominantTheme(members: ClusterProject[]): string {
  const counts = new Map<Theme, number>();
  members.forEach((m) => counts.set(m.theme, (counts.get(m.theme) ?? 0) + 1));
  let best: Theme | null = null;
  let max = 0;
  counts.forEach((c, t) => {
    if (c > max) {
      max = c;
      best = t;
    }
  });
  return best ?? '—';
}

function buildThemeDistribution(
  groups: { id: string; name: string; members: ClusterProject[] }[],
): { cluster: string; size: number; [theme: string]: number | string }[] {
  return groups.map((g) => {
    const total = g.members.length;
    const themeCounts = new Map<string, number>();
    g.members.forEach((m) => themeCounts.set(m.theme, (themeCounts.get(m.theme) ?? 0) + 1));
    const row: { cluster: string; size: number; [theme: string]: number | string } = {
      cluster: g.name,
      size: g.members.length,
    };
    themeCounts.forEach((count, theme) => {
      row[theme] = Math.round((count / total) * 100);
    });
    return row;
  });
}
