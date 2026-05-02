export function reputationBadge(rep: bigint): { label: string; emoji: string } {
  const n = Number(rep);
  if (n >= 100) return { label: 'Expert', emoji: '🏆' };
  if (n >= 50) return { label: 'Pro Dev', emoji: '🎖️' };
  if (n >= 10) return { label: 'Contributor Bronze', emoji: '🏅' };
  return { label: 'Newcomer', emoji: '✨' };
}
