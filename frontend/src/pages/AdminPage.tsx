import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useVoting } from '../voting/useVoting';
import type { Candidate, Election } from '../voting/types';

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

export default function AdminPage() {
  const { election, updateElection, hardReset } = useVoting();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateTagline, setCandidateTagline] = useState('');

  const canCreate = title.trim().length > 2;

  const current = election;

  const nextCandidates = useMemo(() => current?.candidates ?? [], [current]);

  const createElection = () => {
    const e: Election = {
      id: newId('election'),
      title: title.trim(),
      description: description.trim() || undefined,
      createdAt: Date.now(),
      candidates: [],
    };
    updateElection(e);
    setTitle('');
    setDescription('');
  };

  const addCandidate = () => {
    if (!current) return;
    if (candidateName.trim().length < 2) return;
    const c: Candidate = {
      id: newId('cand'),
      name: candidateName.trim(),
      tagline: candidateTagline.trim() || undefined,
    };
    updateElection({ ...current, candidates: [c, ...current.candidates] });
    setCandidateName('');
    setCandidateTagline('');
  };

  const removeCandidate = (candidateId: string) => {
    if (!current) return;
    updateElection({ ...current, candidates: current.candidates.filter((c) => c.id !== candidateId) });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card title="Election config (mock)">
          {!current ? (
            <div className="text-sm text-slate-300">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Current election</div>
                <div className="mt-1 text-sm font-semibold text-white">{current.title}</div>
                {current.description ? <div className="mt-1 text-sm text-slate-300">{current.description}</div> : null}
                <div className="mt-2 text-xs text-slate-500">ID: {current.id}</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-400">New election title</div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                    placeholder="e.g. Class President 2026"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Description</div>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={createElection} disabled={!canCreate}>
                  Create / Replace election
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card title="Candidates (mock)">
          {!current ? null : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-400">Candidate name</div>
                  <input
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                    placeholder="e.g. Nguyen Van A"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Tagline</div>
                  <input
                    value={candidateTagline}
                    onChange={(e) => setCandidateTagline(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={addCandidate} disabled={candidateName.trim().length < 2}>
                  Add candidate
                </Button>
              </div>

              <div className="space-y-2">
                {nextCandidates.length === 0 ? (
                  <div className="text-sm text-slate-400">No candidates yet.</div>
                ) : (
                  nextCandidates.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{c.name}</div>
                        {c.tagline ? <div className="mt-1 text-xs text-slate-400">{c.tagline}</div> : null}
                      </div>
                      <Button variant="ghost" onClick={() => removeCandidate(c.id)}>
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Danger zone">
          <div className="space-y-3">
            <div className="text-sm text-slate-300">This resets mock election + votes on this device.</div>
            <Button variant="danger" onClick={hardReset}>
              Hard reset
            </Button>
          </div>
        </Card>

        <Card title="Next step: On-chain admin">
          <div className="space-y-2 text-sm text-slate-300">
            <div>
              In Web3 mode, admin actions should be governed by:
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                <li>Capability objects (admin cap)</li>
                <li>Allowlist / role checks</li>
                <li>Events for indexers</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

