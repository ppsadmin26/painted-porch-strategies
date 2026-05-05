
-- Add is_primary column to blog_post_categories
ALTER TABLE public.blog_post_categories
ADD COLUMN is_primary boolean NOT NULL DEFAULT false;

-- Create a partial unique index to ensure at most one primary category per post
CREATE UNIQUE INDEX idx_blog_post_categories_one_primary
ON public.blog_post_categories (post_id)
WHERE is_primary = true;
