import { useMemo } from 'react';
import { Card } from '../components/Card';
import { useVoting } from '../voting/useVoting';

export default function ResultsPage() {
  const { election, results, votes } = useVoting();

  const totalVotes = votes.length;

  const rows = useMemo(() => {
    if (!election) return [];
    return election.candidates
      .map((c) => {
        const count = results.get(c.id) ?? 0;
        const pct = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
        return { ...c, count, pct };
      })
      .sort((a, b) => b.count - a.count);
  }, [election, results, totalVotes]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card title="Live results">
          {!election ? (
            <div className="text-sm text-slate-300">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">{election.title}</div>
                <div className="mt-1 text-xs text-slate-400">{totalVotes} total votes</div>
              </div>

              <div className="space-y-3">
                {rows.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{r.name}</div>
                        {r.tagline ? <div className="mt-1 text-xs text-slate-400">{r.tagline}</div> : null}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">{r.count} votes</div>
                        <div className="text-xs text-slate-400">{r.pct}%</div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-indigo-400"
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Verification">
          <div className="space-y-2 text-sm text-slate-300">
            <div>
              Current implementation is <span className="font-semibold text-white">mock storage</span> (local machine).
            </div>
            <div className="text-xs text-slate-500">
              For Web3 mode, results should be derived from on-chain events or an indexer (e.g. Sui RPC / GraphQL / custom indexer).
            </div>
          </div>
        </Card>

        <Card title="Export">
          <div className="space-y-3">
            <div className="text-sm text-slate-300">You can copy this JSON for report/demo.</div>
            <pre className="max-h-64 overflow-auto rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-slate-200">
              {JSON.stringify(
                {
                  electionId: election?.id,
                  totalVotes,
                  results: rows.map((r) => ({ candidateId: r.id, name: r.name, votes: r.count, pct: r.pct })),
                },
                null,
                2
              )}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}

