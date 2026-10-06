/**
 * Computes the SHA-256 hash of an ArrayBuffer using native browser Web Crypto API.
 */
export async function computeFileHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
