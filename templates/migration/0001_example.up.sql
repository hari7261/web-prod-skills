-- Expand phase: add nullable column with safe lock timeout
SET lock_timeout = '2s';
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS external_ref VARCHAR(128);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_external_ref ON public.items (external_ref);
