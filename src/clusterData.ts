import { Theme, compositeScore, Weights, Project } from '@/types';
import { SAMPLE_PROJECTS } from '@/data';

export interface ClusterProject {
  id: string;
  teamName: string;
  theme: Theme;
  clusterId: string;
  clusterName: string;
  similarityScore: number;
  compositeScore: number;
  x: number;
  y: number;
  isOutlier: boolean;
  status: string;
}

export interface ClusterGroup {
  id: string;
  name: string;
  color: string;
  tint: string;
  ring: string;
  members: ClusterProject[];
}

export interface ClusterConfig {
  id: string;
  name: string;
  color: string;
  tint: string;
  ring: string;
}

const CLUSTER_PALETTE: ClusterConfig[] = [
  { id: 'A', name: 'Cluster A', color: '#6366f1', tint: 'bg-indigo-500/10', ring: 'ring-indigo-500/25' },
  { id: 'B', name: 'Cluster B', color: '#14b8a6', tint: 'bg-teal-500/10', ring: 'ring-teal-500/25' },
  { id: 'C', name: 'Cluster C', color: '#f59e0b', tint: 'bg-amber-500/10', ring: 'ring-amber-500/25' },
  { id: 'D', name: 'Cluster D', color: '#ec4899', tint: 'bg-pink-500/10', ring: 'ring-pink-500/25' },
  { id: 'E', name: 'Cluster E', color: '#0ea5e9', tint: 'bg-sky-500/10', ring: 'ring-sky-500/25' },
  { id: 'F', name: 'Cluster F', color: '#84cc16', tint: 'bg-lime-500/10', ring: 'ring-lime-500/25' },
  { id: 'G', name: 'Cluster G', color: '#a855f7', tint: 'bg-purple-500/10', ring: 'ring-purple-500/25' },
  { id: 'H', name: 'Cluster H', color: '#06b6d4', tint: 'bg-cyan-500/10', ring: 'ring-cyan-500/25' },
  { id: 'OUT', name: 'Outliers', color: '#f43f5e', tint: 'bg-rose-500/10', ring: 'ring-rose-500/25' },
];

export const CLUSTER_CONFIGS: Record<string, ClusterConfig> = Object.fromEntries(
  CLUSTER_PALETTE.map((c) => [c.id, c]),
);

export function getClusterConfig(id: string): ClusterConfig {
  return CLUSTER_CONFIGS[id] ?? {
    id,
    name: `Cluster ${id}`,
    color: '#64748b',
    tint: 'bg-slate-600/10',
    ring: 'ring-slate-600/25',
  };
}

const DEFAULT_WEIGHTS: Weights = { technical: 40, design: 30, presentation: 30 };

function projectToClusterProject(p: Project): ClusterProject {
  const coord = p as Project & { x?: number; y?: number };
  const clusterId = p.clusterGroup === 'Outliers' ? 'OUT' : p.clusterGroup.replace('Cluster ', '');
  const isOutlier = clusterId === 'OUT';
  // similarity score — outliers get low, others get 65-95
  const similarity = isOutlier
    ? 30 + Math.round(Math.random() * 20)
    : 65 + Math.round(Math.random() * 30);
  return {
    id: p.id,
    teamName: p.teamName,
    theme: p.theme,
    clusterId,
    clusterName: p.clusterGroup,
    similarityScore: similarity,
    compositeScore: compositeScore(p, DEFAULT_WEIGHTS),
    x: coord.x ?? 50,
    y: coord.y ?? 50,
    isOutlier,
    status: p.status,
  };
}

export const CLUSTER_PROJECTS: ClusterProject[] = SAMPLE_PROJECTS.map(projectToClusterProject);

export function buildClusterGroups(projects: ClusterProject[]): ClusterGroup[] {
  const map = new Map<string, ClusterProject[]>();
  for (const p of projects) {
    const arr = map.get(p.clusterId) ?? [];
    arr.push(p);
    map.set(p.clusterId, arr);
  }
  const groups: ClusterGroup[] = [];
  for (const [id, members] of map.entries()) {
    const cfg = getClusterConfig(id);
    groups.push({
      id,
      name: cfg.name,
      color: cfg.color,
      tint: cfg.tint,
      ring: cfg.ring,
      members,
    });
  }
  return groups.sort((a, b) => {
    if (a.id === 'OUT') return 1;
    if (b.id === 'OUT') return -1;
    return b.members.length - a.members.length;
  });
}

export function avgSimilarity(members: ClusterProject[]): number {
  if (!members.length) return 0;
  return Math.round(members.reduce((a, m) => a + m.similarityScore, 0) / members.length);
}

export { CLUSTER_PALETTE };
