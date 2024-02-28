function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): T {
  let timeoutId: number | null = null;

  return function (...args: Parameters<T>): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      func(...args);
    }, wait);
  } as T;
}

export default debounce;
