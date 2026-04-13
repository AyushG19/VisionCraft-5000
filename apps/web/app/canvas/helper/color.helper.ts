function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const PALETTE = [
  "#FFFF00",
  "#FFD700",
  "#FF8C00",
  "#FF4500",
  "#DC143C",
  "#FF00FF",
  "#8B4513",
  "#00FF00",
  "#8B0000",
  "#B22222",
] as const;

export function getUserColor(userId: string): (typeof PALETTE)[number] {
  const hash = hashUserId(userId);
  return PALETTE[hash % PALETTE.length]!;
}
