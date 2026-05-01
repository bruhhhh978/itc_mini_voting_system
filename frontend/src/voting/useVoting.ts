import { useEffect, useMemo, useState } from 'react';
import type { Election, VoteRecord } from './types';
import { createDefaultElection } from './mockSeed';
import { loadElection, loadVotes, resetAll, saveElection, saveVotes } from './storage';

export function useVoting() {
  const [election, setElection] = useState<Election | null>(null);
  const [votes, setVotes] = useState<VoteRecord[]>([]);

  useEffect(() => {
    const existing = loadElection();
    if (existing) setElection(existing);
    else {
      const seeded = createDefaultElection();
      saveElection(seeded);
      setElection(seeded);
    }
    setVotes(loadVotes());
  }, []);

  const results = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of votes) map.set(v.candidateId, (map.get(v.candidateId) ?? 0) + 1);
    return map;
  }, [votes]);

  const hasVoted = (walletAddress: string) => {
    if (!election) return false;
    return votes.some((v) => v.electionId === election.id && v.walletAddress === walletAddress);
  };

  const castVote = (walletAddress: string, candidateId: string) => {
    if (!election) throw new Error('Election not initialized');
    if (hasVoted(walletAddress)) throw new Error('This wallet has already voted');
    const record: VoteRecord = {
      electionId: election.id,
      walletAddress,
      candidateId,
      votedAt: Date.now(),
    };
    const next = [record, ...votes];
    setVotes(next);
    saveVotes(next);
    return record;
  };

  const updateElection = (next: Election) => {
    setElection(next);
    saveElection(next);
  };

  const hardReset = () => {
    resetAll();
    const seeded = createDefaultElection();
    saveElection(seeded);
    setElection(seeded);
    setVotes([]);
    saveVotes([]);
  };

  return {
    election,
    votes,
    results,
    hasVoted,
    castVote,
    updateElection,
    hardReset,
  };
}

