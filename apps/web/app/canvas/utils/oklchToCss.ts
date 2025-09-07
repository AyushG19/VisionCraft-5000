const oklchToCSS = ({
  l,
  c,
  h,
}: {
  l: number;
  c: number;
  h: number;
}): string => {
  return `oklch(${l} ${c} ${h})`;
};

export default oklchToCSS;
