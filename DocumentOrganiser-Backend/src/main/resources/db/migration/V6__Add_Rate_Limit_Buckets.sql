CREATE TABLE IF NOT EXISTS rate_limit_buckets (
    bucket_key VARCHAR(255) PRIMARY KEY,
    window_start BIGINT NOT NULL,
    request_count INTEGER NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    entity_version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_updated_at
    ON rate_limit_buckets(updated_at);
