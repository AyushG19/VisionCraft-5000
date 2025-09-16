export default function debounce<T extends any[]>(
  fn: (...args: T) => void,
  timer: number = 5000
) {
  let timeOut: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timeOut);
    timeOut = setTimeout(() => {
      fn(...args);
    }, timer);
  };
}
