export function debounce<T extends any[]>(
  fn: (...args: T) => void,
  timer: number = 5000,
) {
  let timeOut: ReturnType<typeof setTimeout>;
  return function wrappedDebounce(...args: T) {
    clearTimeout(timeOut);
    timeOut = setTimeout(() => {
      //@ts-ignore
      fn.apply(this, args);
    }, timer);
  };
}

type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};

type ThrottledFunction<T extends any[]> = {
  (...args: T): any;
  cancel: () => void;
  flush: () => any;
};

export function throttle<T extends any[]>(
  fn: (...args: T) => void,
  wait: number,
  options: ThrottleOptions = {},
): ThrottledFunction<T> {
  const isLeading = options.leading ?? true;
  const isTrailing = options.trailing ?? true;

  let lastCallTime = 0;
  let timer: ReturnType<typeof setTimeout> | number | null = null;
  let lastThis: any = null;
  let lastArgs: T | null = null;
  let result: any = undefined;

  function trailingEdge(now: number) {
    result = fn.apply(lastThis, lastArgs!);
    lastCallTime = 0;
    lastArgs = null;
    lastThis = null;

    return result;
  }

  function remainingCooldown(current: number): number {
    return wait - (current - lastCallTime);
  }

  function timeExpired() {
    const now = Date.now();
    if (isTrailing && lastArgs) trailingEdge(now);
    timer = null;
  }

  function wrappedThrottle(...args: T) {
    const now = Date.now();
    let isFirstCall = lastCallTime === 0;
    if (isFirstCall && !isLeading) {
      lastCallTime = now;
    }
    let remaining = remainingCooldown(now);
    let cooldownEnded = remaining <= 0 || remaining > wait;

    if (cooldownEnded) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      //@ts-ignore
      result = fn.apply(this, args);
      lastCallTime = now;

      if (!timer && !isTrailing) {
        lastThis = null;
        lastArgs = null;
      }

      return result;
    }

    lastArgs = args;
    //@ts-ignore
    lastThis = this;

    if (isTrailing && !timer) {
      timer = setTimeout(timeExpired, remaining);
    }

    return result;
  }

  wrappedThrottle.cancel = function (): void {
    if (timer) clearTimeout(timer);
    lastArgs = null;
    lastThis = null;
    lastCallTime = 0;
    timer = null;
  };

  wrappedThrottle.flush = function (): void {
    if (timer && lastArgs) {
      return trailingEdge(Date.now());
    }
    return result;
  };
  return wrappedThrottle;
}
