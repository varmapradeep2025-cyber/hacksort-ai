export type Theme =
  | 'Crop Rotation'
  | 'Farming/Agriculture'
  | 'Hospital Management'
  | 'Student Attendance System'
  | 'Open Innovation'
  | 'Fake Documents Detection';

export const THEMES: Theme[] = [
  'Crop Rotation',
  'Farming/Agriculture',
  'Hospital Management',
  'Student Attendance System',
  'Open Innovation',
  'Fake Documents Detection',
];

export type JudgeAction = 'star' | 'flag' | 'reject' | null;

export type SubmissionStatus = 'pending' | 'scored' | 'reviewed';

export interface Project {
  id: string;
  teamName: string;
  theme: Theme;
  githubUrl: string;
  demoVideoUrl: string;
  technicalScore: number;
  designScore: number;
  presentationScore: number;
  clusterGroup: string;
  clusterSize: number;
  simplicityLane: boolean;
  aiNotes: string;
  action: JudgeAction;
  status: SubmissionStatus;
  createdAt: number;
}

export type ViewKey = 'participant' | 'judge' | 'organizer' | 'clusters';

export interface Weights {
  technical: number;
  design: number;
  presentation: number;
}

export type SortField = 'composite' | 'technical' | 'design' | 'presentation' | 'newest';

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function compositeScore(
  p: Pick<Project, 'technicalScore' | 'designScore' | 'presentationScore'>,
  w: Weights,
): number {
  const sum = w.technical + w.design + w.presentation;
  const safe = sum === 0 ? 1 : sum;
  const raw =
    (p.technicalScore * w.technical +
      p.designScore * w.design +
      p.presentationScore * w.presentation) /
    safe;
  return Math.round(raw * 100) / 100;
}
