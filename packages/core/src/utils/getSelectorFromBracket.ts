function getSelectorFromBracket(inputString: string) {
  const regex = /^\[([^\]]+)]:(.*)/;
  const match = inputString.match(regex);

  if (match) {
    return {
      content: match[1],
      restOfString: match[2],
    };
  }
  return null;
}

export default getSelectorFromBracket;
