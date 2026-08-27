import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_BUCKETS = new Set(["media", "videos", "product-images"]);

/**
 * Public read-only proxy for Storage objects.
 * Buckets are private, so files are streamed through this route instead of
 * relying on public bucket URLs.
 *
 * URL shape: /api/public/storage/<bucket>/<path/to/file.jpg>
 */
export const Route = createFileRoute("/api/public/storage/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = (params as { _splat?: string })._splat ?? "";
        const decoded = decodeURIComponent(splat);
        const slash = decoded.indexOf("/");
        if (slash < 1) return new Response("Not found", { status: 404 });

        const bucket = decoded.slice(0, slash);
        const objectPath = decoded.slice(slash + 1);

        if (!ALLOWED_BUCKETS.has(bucket) || !objectPath || objectPath.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from(bucket).download(objectPath);

        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(data.stream(), {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
