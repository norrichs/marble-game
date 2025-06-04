


export const parsePath = (pathString: string): (string | number)[] => {
  const regex = /([a-zA-Z])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/g;
  const result: (string | number)[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(pathString)) !== null) {
    if (match[1]) {
      result.push(match[1]);
    } else if (match[2] || match[0]) {
      result.push(Number(match[0]));
    }
  }
  return result;
}