export const splitIntoChunks = (text, chunkSize = 700, overlap = 100) => {
  const tokens = text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (!tokens.length) return [];

  const chunks = [];
  let start = 0;

  while (start < tokens.length) {
    const end = Math.min(start + chunkSize, tokens.length);
    chunks.push(tokens.slice(start, end).join(" "));

    if (end >= tokens.length) break;
    start = end - overlap;
  }

  return chunks;
};