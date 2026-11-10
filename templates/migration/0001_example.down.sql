-- Rollback for 0001_example
SET lock_timeout = '2s';
DROP INDEX CONCURRENTLY IF EXISTS idx_items_external_ref;
ALTER TABLE public.items DROP COLUMN IF EXISTS external_ref;
