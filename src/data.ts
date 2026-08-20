import { Project, Theme, THEMES, SubmissionStatus } from '@/types';

const TEAM_PREFIXES = [
  'Agri', 'Field', 'Medi', 'Care', 'Present', 'Roll', 'Docu', 'Wild', 'Quantum', 'Neuro',
  'Cyber', 'Pixel', 'Data', 'Cloud', 'Smart', 'Eco', 'Bio', 'Tech', 'Nova', 'Forge',
  'Bright', 'Swift', 'Deep', 'Open', 'Green', 'Health', 'Edu', 'Secure', 'Farm', 'Med',
  'Atten', 'Crop', 'Innova', 'Detect', 'Track', 'Scan', 'Link', 'Hub', 'Zone', 'Lab',
  'Vision', 'Logic', 'Code', 'Byte', 'Mind', 'Spark', 'Pulse', 'Wave', 'Core', 'Edge',
];

const TEAM_SUFFIXES = [
  'Nova', 'Flow', 'Desk', 'Path', 'Guard', 'Card', 'Sort', 'Sync', 'Net', 'Box',
  'Hub', 'Lab', 'Ops', 'IQ', 'AI', 'X', 'ify', 'ly', 'er', 'io',
  'verse', 'base', 'ware', 'sense', 'track', 'scan', 'link', 'zone', 'point', 'grid',
];

const AI_NOTE_TEMPLATES = [
  'Strong commit history with frequent, well-scoped commits. Modular architecture separating core modules. README lacks detailed setup instructions.',
  'Lower-technical-complexity project built on a no-code platform. Limited backend logic but clear UX flow. Good candidate for the Simplicity Lane.',
  'Excellent engineering: role-based access and well-structured modules. Polished UI with consistent design tokens. Demo walkthrough covers edge cases.',
  'Solid data model. UI is functional but visually inconsistent across screens. Presentation covers the core flow but misses some edge cases.',
  'ML model with a clean web UI for upload. Good accuracy on sample set. Would benefit from explainability of confidence scores.',
  'Creative cross-domain idea. Implementation is partial but concept is strong. Architecture could be modularized further.',
  'QR-based approach with offline sync. Clean mobile-first design. Presentation is a bit rushed and skips the reporting dashboard.',
  'Simple spreadsheet-backed tracker. Minimal code, easy to understand. Fits the Simplicity Lane as a first-time team effort.',
  'Well-documented API with test coverage. Authentication handled cleanly. Frontend could use more polish on form validation states.',
  'Ambitious scope for the timeframe. Core feature works; secondary features are stubbed. Recommend focusing the demo on the working flow.',
];

const CLUSTER_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length)];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function generateProjects(count: number, seed = 42): Project[] {
  const rand = seeded(seed);
  const projects: Project[] = [];
  const themeCentroids: Record<Theme, { x: number; y: number }> = {
    'Crop Rotation': { x: 25, y: 30 },
    'Farming/Agriculture': { x: 30, y: 38 },
    'Hospital Management': { x: 68, y: 65 },
    'Student Attendance System': { x: 50, y: 52 },
    'Open Innovation': { x: 55, y: 25 },
    'Fake Documents Detection': { x: 75, y: 45 },
  };

  // Assign clusters — group by theme proximity with some crossover
  const clusterAssignments: string[] = [];
  for (let i = 0; i < count; i++) {
    const r = rand();
    if (r < 0.08) {
      clusterAssignments.push('OUT');
    } else {
      clusterAssignments.push(pick(CLUSTER_LETTERS, rand()));
    }
  }

  for (let i = 0; i < count; i++) {
    const theme = pick(THEMES, rand());
    const prefix = pick(TEAM_PREFIXES, rand());
    const suffix = pick(TEAM_SUFFIXES, rand());
    const teamName = `${prefix}${suffix}${i > TEAM_PREFIXES.length * TEAM_SUFFIXES.length ? ` ${i}` : ''}`;
    const clusterId = clusterAssignments[i];
    const isOutlier = clusterId === 'OUT';
    const clusterGroup = isOutlier ? 'Outliers' : `Cluster ${clusterId}`;

    // Plausible scores — correlated-ish but randomized
    const base = 4 + rand() * 5;
    const technicalScore = round1(Math.min(10, Math.max(0, base + (rand() - 0.5) * 3)));
    const designScore = round1(Math.min(10, Math.max(0, base + (rand() - 0.5) * 3)));
    const presentationScore = round1(Math.min(10, Math.max(0, base + (rand() - 0.5) * 3)));

    // Simplicity lane — lower technical complexity
    const simplicityLane = technicalScore < 5.5 && rand() > 0.4;

    // Scatter coords — near theme centroid with jitter, outliers scattered
    const centroid = themeCentroids[theme];
    const jitter = isOutlier ? 30 : 12;
    const x = Math.min(98, Math.max(2, centroid.x + (rand() - 0.5) * jitter));
    const y = Math.min(98, Math.max(2, centroid.y + (rand() - 0.5) * jitter));

    const statusRoll = rand();
    const status: SubmissionStatus = statusRoll < 0.35 ? 'pending' : statusRoll < 0.75 ? 'scored' : 'reviewed';

    const clusterSize = clusterAssignments.filter((c) => c === clusterId).length;

    projects.push({
      id: `p${i + 1}`,
      teamName,
      theme,
      githubUrl: `https://github.com/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}`,
      demoVideoUrl: `https://youtu.be/demo${i + 1}`,
      technicalScore,
      designScore,
      presentationScore,
      clusterGroup,
      clusterSize,
      simplicityLane,
      aiNotes: pick(AI_NOTE_TEMPLATES, rand()),
      action: null,
      status,
      createdAt: Date.now() - Math.floor(rand() * 1000 * 60 * 60 * 24 * 30),
      // scatter coords stored but not on Project type — handled in clusterData
      ...(typeof x === 'number' ? {} : {}),
    });
    // store x/y via a side map handled in clusterData generator instead
    (projects[i] as Project & { x?: number; y?: number }).x = Math.round(x * 10) / 10;
    (projects[i] as Project & { x?: number; y?: number }).y = Math.round(y * 10) / 10;
  }

  // Recompute cluster sizes accurately
  const sizeMap = new Map<string, number>();
  projects.forEach((p) => {
    const key = p.clusterGroup;
    sizeMap.set(key, (sizeMap.get(key) ?? 0) + 1);
  });
  projects.forEach((p) => {
    p.clusterSize = sizeMap.get(p.clusterGroup) ?? 1;
  });

  return projects;
}

export const SAMPLE_PROJECTS: Project[] = generateProjects(50);

export const ALL_CLUSTERS: string[] = Array.from(
  new Set(SAMPLE_PROJECTS.map((p) => p.clusterGroup)),
).sort();
