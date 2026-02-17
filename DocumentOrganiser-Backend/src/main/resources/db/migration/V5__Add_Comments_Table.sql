-- Flyway V5: Comments table
CREATE TABLE IF NOT EXISTS document_comments (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID         NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id     UUID         NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    content     TEXT         NOT NULL,
    parent_id   UUID         REFERENCES document_comments(id)  ON DELETE CASCADE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_document_id ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id     ON document_comments(user_id);
