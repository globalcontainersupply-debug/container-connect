UPDATE storage.buckets
SET public = true
WHERE id IN ('product-images', 'media', 'videos');
