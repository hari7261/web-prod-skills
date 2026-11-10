SET lock_timeout = '2s';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_name ON items (name);

