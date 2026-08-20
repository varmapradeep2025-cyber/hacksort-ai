import { useState } from 'react';
import { TopNav } from '@/components';
import { SubmissionForm, JudgeDashboard, OrganizerPanel, ClusterAnalysis } from '@/components';
import { SAMPLE_PROJECTS } from '@/data';
import { CLUSTER_PROJECTS } from '@/clusterData';
import { ViewKey, Weights, Project, JudgeAction } from '@/types';

const DEFAULT_WEIGHTS: Weights = { technical: 40, design: 30, presentation: 30 };

export default function App() {
  const [view, setView] = useState<ViewKey>('participant');
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);

  function handleAction(id: string, action: Exclude<JudgeAction, null>) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, action: p.action === action ? null : action } : p)),
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <TopNav view={view} onChange={setView} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {view === 'participant' && <SubmissionForm />}
        {view === 'judge' && (
          <JudgeDashboard projects={projects} weights={weights} onAction={handleAction} />
        )}
        {view === 'organizer' && (
          <OrganizerPanel projects={projects} weights={weights} onWeights={setWeights} />
        )}
        {view === 'clusters' && <ClusterAnalysis projects={CLUSTER_PROJECTS} />}
      </main>
    </div>
  );
}
