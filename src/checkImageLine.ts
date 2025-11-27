interface ImageMatch {
  alt: string;
  url: string;
}

// 只匹配 ![alt](url)，不包含 title，允许出现在整行任意位置
const imageRegex = /^!\[(.*?)\]\((.+)\)$/;

export function getMarkdownImageFromLine(lineText: string): ImageMatch | undefined {
  const match = lineText.match(imageRegex);
  console.log(`getMarkdownImageFromLine, ${match}`)
  if (!match) return undefined;

  const [, alt, url] = match;
  return { alt, url };
}