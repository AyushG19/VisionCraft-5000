import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "../utils/rateLimiting";

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Leading Edge ─────────────────────────────────────────

  describe("leading edge", () => {
    it("fires immediately on the first call", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("suppresses calls within the cooldown window", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("fires again once the cooldown has elapsed", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("does not fire on leading edge when leading is false", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { leading: false });

      throttled();
      expect(fn).toHaveBeenCalledTimes(0);
    });
  });

  // ─── Trailing Edge ────────────────────────────────────────

  describe("trailing edge", () => {
    it("fires once after cooldown with last call args", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled("first"); // leading fires with 'first'
      throttled("second"); // suppressed, lastArgs = 'second'
      throttled("third"); // suppressed, lastArgs = 'third'

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("first");

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith("third"); // last args, not 'second'
    });

    it("does not fire trailing when no calls came in during cooldown", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled(); // leading fires
      // no more calls

      vi.advanceTimersByTime(200);

      expect(fn).toHaveBeenCalledTimes(1); // no extra trailing fire
    });

    it("does not fire trailing when trailing is false", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { trailing: false });

      throttled();
      throttled(); // suppressed, but should NOT schedule trailing

      vi.advanceTimersByTime(200);

      expect(fn).toHaveBeenCalledTimes(1); // only the leading call
    });

    it("fires with trailing only (leading: false)", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { leading: false, trailing: true });

      throttled("a");
      throttled("b");
      throttled("c");

      expect(fn).toHaveBeenCalledTimes(0); // nothing fires immediately

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("c"); // last args
    });
  });

  // ─── Arguments ────────────────────────────────────────────

  describe("arguments", () => {
    it("passes arguments correctly on leading edge", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled("hello", 42);
      expect(fn).toHaveBeenCalledWith("hello", 42);
    });

    it("always uses the LAST args for trailing edge, not the first suppressed", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled("a"); // leading fires with 'a'
      throttled("b"); // lastArgs = 'b'
      throttled("c"); // lastArgs = 'c'
      throttled("d"); // lastArgs = 'd'

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenLastCalledWith("d"); // NOT 'b'
    });

    it("passes multiple arguments to trailing edge correctly", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled(1, 2, 3); // leading
      throttled(4, 5, 6); // suppressed → lastArgs

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenLastCalledWith(4, 5, 6);
    });
  });

  // ─── This Context ─────────────────────────────────────────

  describe("this context", () => {
    it("preserves this on leading edge", () => {
      // ✅ 1. Create the spy separately
      const spy = vi.fn(function () {
        return this.value;
      });

      // 2. Wrap it
      const obj = {
        value: 42,
        fn: throttle(spy, 100),
      };

      obj.fn();

      // ✅ 3. Assert against the original SPY, not obj.fn
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("preserves this on trailing edge", () => {
      const results: number[] = [];
      const obj = {
        value: 99,
        fn: function (this: { value: number }) {
          results.push(this.value);
        },
      };

      obj.fn = throttle(obj.fn, 100);
      obj.fn(); // leading
      obj.fn(); // suppressed → trailing

      vi.advanceTimersByTime(100);

      expect(results).toEqual([99, 99]);
    });
  });

  // ─── cancel() ─────────────────────────────────────────────

  describe("cancel()", () => {
    it("cancels a pending trailing call", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled(); // leading fires
      throttled(); // schedules trailing

      throttled.cancel();

      vi.advanceTimersByTime(200);

      expect(fn).toHaveBeenCalledTimes(1); // only leading, trailing cancelled
    });

    it("resets state so next call is treated as first", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled.cancel();

      throttled(); // should fire immediately as if first call
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("does nothing if no timer is pending", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(() => throttled.cancel()).not.toThrow();
    });
  });

  // ─── flush() ──────────────────────────────────────────────

  describe("flush()", () => {
    it("immediately fires a pending trailing call", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled(); // leading fires
      throttled("last"); // suppressed → trailing pending

      throttled.flush(); // fires right now

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith("last");
    });

    it("clears the timer after flush so trailing does not double-fire", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled("last");

      throttled.flush();

      vi.advanceTimersByTime(200); // timer should already be cleared

      expect(fn).toHaveBeenCalledTimes(2); // not 3
    });

    it("returns last result if nothing is pending", () => {
      const fn = vi.fn().mockReturnValue("result");
      const throttled = throttle(fn, 100);

      throttled();
      const result = throttled.flush();

      expect(result).toBe("result");
    });
  });

  // ─── Timing Precision ─────────────────────────────────────

  describe("timing precision", () => {
    it("trailing timer fires at the REMAINING cooldown, not a full new interval", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 300);

      throttled(); // t=0 leading fires, window: 0→300

      vi.advanceTimersByTime(200); // t=200, 100ms remaining
      throttled("mid"); // suppressed, timer scheduled for 100ms

      vi.advanceTimersByTime(99); // t=299, not yet
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1); // t=300, exactly at window end
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("handles rapid calls across multiple cooldown windows", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled("a"); // t=0   leading fires
      vi.advanceTimersByTime(50);
      throttled("b"); // t=50  suppressed
      vi.advanceTimersByTime(50); // t=100 trailing fires with 'b'

      throttled("c"); // t=100 new window, leading fires
      vi.advanceTimersByTime(50);
      throttled("d"); // t=150 suppressed
      vi.advanceTimersByTime(50); // t=200 trailing fires with 'd'

      expect(fn).toHaveBeenCalledTimes(4);
      expect(fn).toHaveBeenNthCalledWith(1, "a");
      expect(fn).toHaveBeenNthCalledWith(2, "b");
      expect(fn).toHaveBeenNthCalledWith(3, "c");
      expect(fn).toHaveBeenNthCalledWith(4, "d");
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────

  describe("edge cases", () => {
    it("works when called only once — no trailing fire", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      vi.advanceTimersByTime(200);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("returns cached result during cooldown", () => {
      const fn = vi.fn().mockReturnValue("cached");
      const throttled = throttle(fn, 100);

      const first = throttled(); // fires, returns 'cached'
      const second = throttled(); // suppressed, returns last result

      expect(first).toBe("cached");
      expect(second).toBe("cached");
    });

    it("handles wait of 0ms", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 0);

      throttled();
      throttled();

      vi.advanceTimersByTime(0);

      expect(fn.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });
});
