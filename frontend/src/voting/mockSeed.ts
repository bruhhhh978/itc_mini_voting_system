import type { Election } from './types';

export function createDefaultElection(): Election {
  return {
    id: 'itc-2026',
    title: 'ITC Mini Voting 2026',
    description: 'Demo election (mock mode). Connect wallet and cast exactly 1 vote.',
    createdAt: Date.now(),
    candidates: [
      { id: 'cand-1', name: 'Alice Nguyen', tagline: 'Transparency • Security • UX' },
      { id: 'cand-2', name: 'Bao Tran', tagline: 'Fast delivery • Strong governance' },
      { id: 'cand-3', name: 'Chi Le', tagline: 'Privacy-first • Fair voting' },
    ],
  };
}

