/**
 * Storage buckets are private, so uploaded files are served through the
 * public proxy route instead of Supabase public bucket URLs.
 */
export function storageProxyUrl(bucket: string, path: string): string {
  const clean = path.split("/").map(encodeURIComponent).join("/");
  return `/api/public/storage/${bucket}/${clean}`;
}
