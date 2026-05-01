export type Candidate = {
  id: string;
  name: string;
  tagline?: string;
};

export type Election = {
  id: string;
  title: string;
  description?: string;
  candidates: Candidate[];
  createdAt: number;
};

export type VoteRecord = {
  electionId: string;
  walletAddress: string;
  candidateId: string;
  votedAt: number;
};

