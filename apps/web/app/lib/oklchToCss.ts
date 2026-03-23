const oklchToCSS = ({
  l = 0,
  c = 0,
  h = 0,
}: {
  l?: number;
  c?: number;
  h?: number;
} = {}): string => {
  return `oklch(${l} ${c} ${h})`;
};

export default oklchToCSS;
