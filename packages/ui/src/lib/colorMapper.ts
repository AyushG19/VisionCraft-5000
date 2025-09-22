interface ParticipantColor {
  name: string;
  color: string;
}

export const attachColorsToParticipants = (
  participants: { user_id: string; name: string }[]
) => {
  const colorPalette = [
    "#FF4500", // OrangeRed
    "#008000", // Green
    "#00008B", // DarkBlue
    "#800080", // Purple
    "#FF1493", // DeepPink
    "#FFD700", // Gold
    "#DC143C", // Crimson
    "#2E8B57", // SeaGreen
  ];

  return participants.reduce<Record<string, ParticipantColor>>((acc, p, i) => {
    acc[p.user_id] = {
      name: p.name,
      color: colorPalette[i % colorPalette.length]!,
    };
    return acc;
  }, {});
};
