-- V9: Workspace Custom Roles for granular RBAC
-- Allows workspaces to define custom roles with specific permissions

CREATE TABLE workspace_custom_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT false,
    is_default_role BOOLEAN NOT NULL DEFAULT false,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    color VARCHAR(7),
    priority INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uk_workspace_role_name UNIQUE (workspace_id, name)
);

-- Indexes for efficient lookups
CREATE INDEX idx_custom_roles_workspace_id ON workspace_custom_roles(workspace_id);
CREATE INDEX idx_custom_roles_system ON workspace_custom_roles(workspace_id, is_system_role);
CREATE INDEX idx_custom_roles_default ON workspace_custom_roles(workspace_id, is_default_role) WHERE is_default_role = true;

-- Function to seed system roles for a workspace
CREATE OR REPLACE FUNCTION seed_workspace_system_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- OWNER role: Full control
    INSERT INTO workspace_custom_roles (workspace_id, name, description, is_system_role, permissions, color, priority)
    VALUES (
        NEW.id,
        'OWNER',
        'Full control over workspace. Can delete workspace and manage all settings.',
        true,
        '["*"]'::jsonb,
        '#8B5CF6',
        100
    );
    
    -- ADMIN role: Manage members and settings
    INSERT INTO workspace_custom_roles (workspace_id, name, description, is_system_role, permissions, color, priority)
    VALUES (
        NEW.id,
        'ADMIN',
        'Can manage members, roles, and workspace settings. Cannot delete workspace.',
        true,
        '["workspace:read", "workspace:manage", "folder:*", "document:*", "member:*", "role:read", "tag:*", "audit:read", "share:*"]'::jsonb,
        '#EC4899',
        80
    );
    
    -- EDITOR role: Create and edit content
    INSERT INTO workspace_custom_roles (workspace_id, name, description, is_system_role, is_default_role, permissions, color, priority)
    VALUES (
        NEW.id,
        'EDITOR',
        'Can create, edit, and delete folders and documents.',
        true,
        true,
        '["workspace:read", "folder:create", "folder:read", "folder:update", "document:*", "tag:read", "tag:assign", "share:create"]'::jsonb,
        '#10B981',
        60
    );
    
    -- CONTRIBUTOR role: Create content but limited edit
    INSERT INTO workspace_custom_roles (workspace_id, name, description, is_system_role, permissions, color, priority)
    VALUES (
        NEW.id,
        'CONTRIBUTOR',
        'Can create documents and folders. Can only edit own content.',
        true,
        '["workspace:read", "folder:create", "folder:read", "document:create", "document:read", "document:download", "tag:read"]'::jsonb,
        '#F59E0B',
        40
    );
    
    -- VIEWER role: Read-only access
    INSERT INTO workspace_custom_roles (workspace_id, name, description, is_system_role, permissions, color, priority)
    VALUES (
        NEW.id,
        'VIEWER',
        'Read-only access. Can view and download documents.',
        true,
        '["workspace:read", "folder:read", "document:read", "document:download", "tag:read"]'::jsonb,
        '#6B7280',
        20
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create system roles when workspace is created
CREATE TRIGGER trg_seed_workspace_roles
    AFTER INSERT ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION seed_workspace_system_roles();

-- Seed system roles for existing workspaces
DO $$
DECLARE
    ws RECORD;
BEGIN
    FOR ws IN SELECT id FROM workspaces LOOP
        -- Only insert if no roles exist for this workspace
        IF NOT EXISTS (SELECT 1 FROM workspace_custom_roles WHERE workspace_id = ws.id) THEN
            -- OWNER
            INSERT INTO workspace_custom_roles (workspace_id, name, description, is_system_role, permissions, color, priority)
            VALUES (ws.id, 'OWNER', 'Full control over workspace.', true, '["*"]'::jsonb, '#8B5CF6', 100);
            
            -- ADMIN
            INSERT INTO workspace_custom_roles (workspace_id, name, description, is_system_role, permissions, color, priority)
            VALUES (ws.id, 'ADMIN', 'Can manage members and settings.', true, 
                '["workspace:read", "workspace:manage", "folder:*", "document:*", "member:*", "role:read", "tag:*", "audit:read", "share:*"]'::jsonb, 
                '#EC4899', 80);
            
            -- EDITOR (default)
            INSERT INTO workspace_custom_roles (workspace_id, name, description, is_system_role, is_default_role, permissions, color, priority)
            VALUES (ws.id, 'EDITOR', 'Can create and edit content.', true, true,
                '["workspace:read", "folder:create", "folder:read", "folder:update", "document:*", "tag:read", "tag:assign", "share:create"]'::jsonb,
                '#10B981', 60);
            
            -- CONTRIBUTOR
            INSERT INTO workspace_custom_roles (workspace_id, name, description, is_system_role, permissions, color, priority)
            VALUES (ws.id, 'CONTRIBUTOR', 'Can create content.', true,
                '["workspace:read", "folder:create", "folder:read", "document:create", "document:read", "document:download", "tag:read"]'::jsonb,
                '#F59E0B', 40);
            
            -- VIEWER
            INSERT INTO workspace_custom_roles (workspace_id, name, description, is_system_role, permissions, color, priority)
            VALUES (ws.id, 'VIEWER', 'Read-only access.', true,
                '["workspace:read", "folder:read", "document:read", "document:download", "tag:read"]'::jsonb,
                '#6B7280', 20);
        END IF;
    END LOOP;
END $$;

-- Update workspace_members to reference custom roles
ALTER TABLE workspace_members 
ADD COLUMN IF NOT EXISTS custom_role_id UUID REFERENCES workspace_custom_roles(id) ON DELETE SET NULL;

-- Index for role lookups on members
CREATE INDEX IF NOT EXISTS idx_workspace_members_custom_role ON workspace_members(custom_role_id);

COMMENT ON TABLE workspace_custom_roles IS 'Custom roles for workspace RBAC. System roles are auto-created per workspace.';
COMMENT ON COLUMN workspace_custom_roles.permissions IS 'JSON array of permission strings. Supports wildcards like "folder:*" and "*" for all.';
COMMENT ON COLUMN workspace_custom_roles.is_system_role IS 'System roles cannot be deleted or have permissions modified.';
COMMENT ON COLUMN workspace_custom_roles.is_default_role IS 'Default role assigned to new members. Only one per workspace.';
