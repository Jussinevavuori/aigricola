/**
 * Ensure matches pattern by full namespaces. No partial namespaces, e.g.
 * `attachments.uploading` does not match pattern `attachments.upload`.
 */
export function keyMatchesPattern(key: string, pattern: string) {
  const patternNss = pattern.split(".").filter(Boolean);
  const keyNss = key.split(".").filter(Boolean);

  let matches = true;
  for (let i = 0; i < patternNss.length; i++) {
    matches &&= patternNss[i] === keyNss[i];
  }

  return matches;
}
