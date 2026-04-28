-- V10: Resource Permissions for granular ACL
-- Allows setting permissions on specific resources for users, roles, or groups

CREATE TABLE resource_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL,  -- FOLDER, DOCUMENT, WORKSPACE
    resource_id UUID NOT NULL,
    principal_type VARCHAR(50) NOT NULL,  -- USER, ROLE, GROUP
    principal_id UUID NOT NULL,
    permission VARCHAR(50) NOT NULL,  -- read, write, delete, share, manage
    effect VARCHAR(10) NOT NULL DEFAULT 'ALLOW',  -- ALLOW or DENY
    conditions JSONB,  -- Optional conditions (IP, time, etc.)
    inherited BOOLEAN NOT NULL DEFAULT false,
    inherited_from UUID,  -- Source resource if inherited
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Prevent duplicate permission entries
    CONSTRAINT uk_resource_permission UNIQUE (workspace_id, resource_type, resource_id, principal_type, principal_id, permission)
);

-- Primary lookup: find all permissions for a resource
CREATE INDEX idx_resource_perm_workspace ON resource_permissions(workspace_id);
CREATE INDEX idx_resource_perm_resource ON resource_permissions(workspace_id, resource_type, resource_id);

-- Find all permissions for a principal
CREATE INDEX idx_resource_perm_principal ON resource_permissions(principal_type, principal_id);

-- Combined lookup for permission checking
CREATE INDEX idx_resource_perm_lookup ON resource_permissions(workspace_id, resource_type, resource_id, principal_type, principal_id);

-- Find expired permissions for cleanup
CREATE INDEX idx_resource_perm_expires ON resource_permissions(expires_at) WHERE expires_at IS NOT NULL;

-- Partial index for DENY permissions (checked first in evaluation)
CREATE INDEX idx_resource_perm_deny ON resource_permissions(workspace_id, resource_type, resource_id) WHERE effect = 'DENY';

COMMENT ON TABLE resource_permissions IS 'Fine-grained ACL permissions on workspace resources. DENY always wins over ALLOW.';
COMMENT ON COLUMN resource_permissions.effect IS 'DENY takes precedence over ALLOW in permission evaluation.';
COMMENT ON COLUMN resource_permissions.inherited IS 'True if this permission was propagated from a parent resource.';
COMMENT ON COLUMN resource_permissions.conditions IS 'Optional JSON conditions like IP restrictions or time-based access.';
