# Fix: uploaded images and videos don't display

## Cause (verified)

All three storage buckets — `product-images`, `media`, `videos` — are created as **private**. The admin pages upload successfully, then build the stored link with `getPublicUrl(...)`, which only resolves for public buckets. On a private bucket that URL returns a 400/404, so the image/video is broken everywhere it is rendered (media library, product galleries, homepage video, and the live site on Cloudflare).

The read policy on `storage.objects` already allows `anon` SELECT for these buckets, so only the bucket flag is wrong.

## Fix

1. Flip the three buckets to public so their existing `getPublicUrl` links resolve:
   - `product-images`, `media`, `videos` → `public = true`
   - Set sensible per-bucket limits at the same time: images capped around 10 MB with image MIME types, videos capped around 200 MB with video MIME types.
2. Keep the existing write policies unchanged — only authenticated admins can upload, update or delete. Public access stays read-only.
3. No changes needed to the upload code in the admin media/videos/product pages; the URLs already stored in the database start working once the buckets are public.

## Verification

- Re-open the admin Media Library and confirm thumbnails render for already-uploaded files.
- Open a product page with an uploaded image and the homepage video block, confirming both load.
- Confirm an anonymous (logged-out) view of the public site also shows them.

## Notes

Existing rows already store the public-format URL, so nothing has to be rewritten in the database. After this change, republish/redeploy is not required for the images themselves — they are served directly from storage.
