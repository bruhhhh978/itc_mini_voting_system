import { useMemo, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { CheckCircle2, Info } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useVoting } from '../voting/useVoting';

export default function VotePage() {
  const account = useCurrentAccount();
  const { election, results, hasVoted, castVote } = useVoting();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const totalVotes = useMemo(() => {
    let sum = 0;
    for (const v of results.values()) sum += v;
    return sum;
  }, [results]);

  const votedAlready = account?.address ? hasVoted(account.address) : false;

  const onVote = () => {
    setError(null);
    setSuccess(null);
    if (!account?.address) {
      setError('Please connect wallet first.');
      return;
    }
    if (!selectedCandidateId) {
      setError('Please select a candidate.');
      return;
    }
    try {
      castVote(account.address, selectedCandidateId);
      setSuccess('Vote submitted successfully (mock mode).');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to vote.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card title="Cast your vote">
          {!election ? (
            <div className="text-sm text-slate-300">Loading election…</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">{election.title}</div>
                <div className="mt-1 text-sm text-slate-300">{election.description}</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {election.candidates.map((c) => {
                  const isSelected = selectedCandidateId === c.id;
                  const count = results.get(c.id) ?? 0;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCandidateId(c.id)}
                      disabled={!account || votedAlready}
                      className={[
                        'text-left rounded-2xl border p-4 transition-colors',
                        isSelected ? 'border-indigo-400 bg-indigo-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10',
                        !account || votedAlready ? 'opacity-75 cursor-not-allowed' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{c.name}</div>
                          {c.tagline ? <div className="mt-1 text-xs text-slate-400">{c.tagline}</div> : null}
                        </div>
                        <div className="text-xs text-slate-400">{count} votes</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                  {success}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-400">
                  {votedAlready ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      This wallet has already voted.
                    </span>
                  ) : account ? (
                    '1 wallet = 1 vote (enforced in mock storage).'
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      Connect wallet to enable voting.
                    </span>
                  )}
                </div>
                <Button onClick={onVote} disabled={!account || votedAlready}>
                  Submit vote
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Quick stats">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-300">
              <span>Total votes</span>
              <span className="font-semibold text-white">{totalVotes}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Mode</span>
              <span className="font-semibold text-white">Mock</span>
            </div>
            <div className="text-xs text-slate-500">
              When you add a real Move voting module, you can switch this page to submit on-chain transactions.
            </div>
          </div>
        </Card>

        <Card title="User-friendly tips">
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Use a wallet that supports Sui Testnet.</li>
            <li>Make sure you have enough gas for a real on-chain vote.</li>
            <li>Results page is shareable for transparency.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

