import type { Election, VoteRecord } from './types';

const KEY_ELECTION = 'mv:election:v1';
const KEY_VOTES = 'mv:votes:v1';

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadElection(): Election | null {
  return safeJsonParse<Election>(localStorage.getItem(KEY_ELECTION));
}

export function saveElection(election: Election) {
  localStorage.setItem(KEY_ELECTION, JSON.stringify(election));
}

export function loadVotes(): VoteRecord[] {
  return safeJsonParse<VoteRecord[]>(localStorage.getItem(KEY_VOTES)) ?? [];
}

export function saveVotes(votes: VoteRecord[]) {
  localStorage.setItem(KEY_VOTES, JSON.stringify(votes));
}

export function resetAll() {
  localStorage.removeItem(KEY_ELECTION);
  localStorage.removeItem(KEY_VOTES);
}

