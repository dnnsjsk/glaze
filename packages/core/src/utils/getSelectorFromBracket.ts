/**
 * Extract a bracketed selector prefix from a utility.
 * @param inputString - A utility optionally beginning with a selector.
 * @returns The selector and remaining utility, or null when absent.
 */
function getSelectorFromBracket(inputString: string) {
  const regex = /^\[([^\]]+)]:(.*)/
  const match = inputString.match(regex)

  if (match) {
    return {
      content: match[1],
      restOfString: match[2],
    }
  }
  return null
}

export default getSelectorFromBracket
