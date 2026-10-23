/**
 * Delay a callback until calls have stopped for the requested interval.
 * @param func - The callback to invoke with the latest arguments.
 * @param wait - The quiet interval in milliseconds.
 * @returns A debounced callback with the same arguments.
 */
function debounce<Arguments extends unknown[]>(
  func: (...args: Arguments) => void,
  wait: number
): (...args: Arguments) => void {
  let timeoutId: number | null = null

  return (...args: Arguments): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export default debounce
