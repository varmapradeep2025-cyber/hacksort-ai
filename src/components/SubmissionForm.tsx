import { useState } from 'react';
import { CheckCircle2, Upload, Link2, Video, Users, Tag, Loader2 } from 'lucide-react';
import { THEMES, Theme } from '@/types';

const GITHUB_URL_RE = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/;

export default function SubmissionForm() {
  const [teamName, setTeamName] = useState('');
  const [theme, setTheme] = useState<Theme | ''>('');
  const [githubUrl, setGithubUrl] = useState('');
  const [pptName, setPptName] = useState('');
  const [demoVideo, setDemoVideo] = useState('');
  const [touched, setTouched] = useState<{ github?: boolean }>({});
  const [submitted, setSubmitted] = useState(false);

  const githubError = touched.github && githubUrl.length > 0 && !GITHUB_URL_RE.test(githubUrl);

  const canSubmit =
    teamName.trim() && theme && GITHUB_URL_RE.test(githubUrl) && demoVideo.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setTouched({ github: true });
      return;
    }
    setSubmitted(true);
  }

  function reset() {
    setTeamName('');
    setTheme('');
    setGithubUrl('');
    setPptName('');
    setDemoVideo('');
    setTouched({});
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center shadow-xl shadow-black/20">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/15 ring-1 ring-teal-400/30">
            <CheckCircle2 className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Submission received — processing…</h2>
          <p className="mt-2 text-sm text-slate-400">
            Your project is being analyzed and clustered. You'll see scores and AI notes appear
            on the Judge dashboard shortly.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-teal-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI triage in progress</span>
          </div>
          <button
            onClick={reset}
            className="mt-8 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Submit another project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Submit your project</h1>
        <p className="mt-1 text-sm text-slate-400">
          Provide your team details and links. Our AI will score and cluster your submission.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20">
        <Field label="Team Name" icon={Users}>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. AgriNova"
            className={inputCls}
          />
        </Field>

        <Field label="Theme" icon={Tag}>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className={inputCls}
          >
            <option value="" disabled>Select a theme…</option>
            {THEMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>

        <div>
          <Field label="GitHub Repo URL" icon={Link2}>
            <input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              onBlur={() => setTouched({ github: true })}
              placeholder="https://github.com/team/project"
              className={`${inputCls} ${
                githubError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
          </Field>
          {githubError && (
            <p className="mt-1.5 text-xs text-red-400">
              Enter a valid GitHub URL in the format https://github.com/owner/repo
            </p>
          )}
        </div>

        <Field label="PPT Upload" icon={Upload}>
          <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-700 px-4 py-4 text-sm text-slate-400 transition hover:border-teal-500/60 hover:text-teal-300">
            <input
              type="file"
              accept=".pdf,.ppt,.pptx"
              className="hidden"
              onChange={(e) => setPptName(e.target.files?.[0]?.name ?? '')}
            />
            {pptName || 'Click to upload your pitch deck (PDF/PPT)'}
          </label>
        </Field>

        <Field label="Demo Video Link" icon={Video}>
          <input
            value={demoVideo}
            onChange={(e) => setDemoVideo(e.target.value)}
            placeholder="https://youtu.be/your-demo"
            className={inputCls}
          />
        </Field>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-all duration-200 hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit project
        </button>
      </form>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20';

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      {children}
    </label>
  );
}
