CREATE INDEX IF NOT EXISTS products_published_sort_idx ON public.products(published, sort_order);
CREATE INDEX IF NOT EXISTS products_condition_idx ON public.products(condition);
CREATE INDEX IF NOT EXISTS blog_posts_published_published_at_idx ON public.blog_posts(published, published_at DESC);
