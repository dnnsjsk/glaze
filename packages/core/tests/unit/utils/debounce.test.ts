import { describe, it, expect, vi, afterEach } from "vitest";
import debounce from "../../../src/utils/debounce";

vi.useFakeTimers();

describe("debounce", () => {
  it("delays the function execution by the specified wait time", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it("calls the debounced function only once for multiple rapid invocations", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(1000);

    expect(mockFn).toHaveBeenCalledOnce();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
