#!/bin/bash
# =============================================================
# Auto-Deploy Frontend — checks GitHub for new commits and
# rebuilds + restarts the Next.js standalone app if changed.
# Designed to run as a cron job on ASG frontend instances.
# =============================================================
set -euo pipefail

REPO_URL="https://github.com/DreamerX00/Full-Stack-Project-DocumentOrganiser.git"
BRANCH="master"
DEPLOY_DIR="/opt/docorganiser/app"
WORK_DIR="/tmp/auto-deploy-frontend"
LOCK_FILE="/tmp/auto-deploy-frontend.lock"
LOG_FILE="/var/log/docorganiser/auto-deploy.log"
COMMIT_FILE="/opt/docorganiser/.current-commit"

log() {
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $*" | tee -a "$LOG_FILE"
}

# ── Guard: only one instance at a time ──
if [ -f "$LOCK_FILE" ]; then
  LOCK_AGE=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE") ))
  if [ "$LOCK_AGE" -gt 1800 ]; then
    log "WARN: Stale lock file (${LOCK_AGE}s old) — removing"
    rm -f "$LOCK_FILE"
  else
    log "Another deploy is running (lock age: ${LOCK_AGE}s) — skipping"
    exit 0
  fi
fi
trap 'rm -f "$LOCK_FILE"' EXIT
touch "$LOCK_FILE"

# ── 1. Get latest remote commit ──
REMOTE_COMMIT=$(git ls-remote "$REPO_URL" "refs/heads/$BRANCH" | awk '{print $1}')
if [ -z "$REMOTE_COMMIT" ]; then
  log "ERROR: Could not fetch remote commit hash"
  exit 1
fi

# ── 2. Compare with currently deployed commit ──
CURRENT_COMMIT=""
if [ -f "$COMMIT_FILE" ]; then
  CURRENT_COMMIT=$(cat "$COMMIT_FILE")
fi

if [ "$REMOTE_COMMIT" = "$CURRENT_COMMIT" ]; then
  log "Up to date (${REMOTE_COMMIT:0:8}) — nothing to do"
  exit 0
fi

log "New commit detected: ${CURRENT_COMMIT:0:8} → ${REMOTE_COMMIT:0:8}"
log "Starting build..."

# ── 3. Clone and build ──
rm -rf "$WORK_DIR"
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$WORK_DIR" >> "$LOG_FILE" 2>&1

cd "$WORK_DIR/DocumentOrganiser-Frontend/document-organiser-frontend"

# Load env vars from Secrets Manager (same as start-frontend.sh)
REGION="us-east-1"
SECRET_NAME="docorganiser/frontend/prod"
if aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" --region "$REGION" --query 'SecretString' --output text > /dev/null 2>&1; then
  SECRET_JSON=$(aws secretsmanager get-secret-value \
    --secret-id "$SECRET_NAME" \
    --region "$REGION" \
    --query 'SecretString' \
    --output text)
  export NEXT_PUBLIC_API_URL=$(echo "$SECRET_JSON" | jq -r '.NEXT_PUBLIC_API_URL // empty')
  log "Loaded NEXT_PUBLIC_API_URL from Secrets Manager"
else
  log "WARN: Could not fetch secrets — building with defaults"
fi

# Remove the "prepare" lifecycle script so npm doesn't try to run
# the missing husky binary (devDependencies are omitted).
npm pkg delete scripts.prepare >> "$LOG_FILE" 2>&1

npm ci --omit=dev >> "$LOG_FILE" 2>&1
npm run build >> "$LOG_FILE" 2>&1

if [ ! -f ".next/standalone/server.js" ]; then
  log "ERROR: Build succeeded but standalone output not found — aborting"
  rm -rf "$WORK_DIR"
  exit 1
fi

log "Build successful — deploying..."

# ── 4. Deploy ──
sudo systemctl stop docorganiser-frontend || true

# Back up current deployment (keep last 2)
if [ -d "$DEPLOY_DIR/.next" ]; then
  BACKUP_DIR="/opt/docorganiser/backups/$(date +%Y%m%d-%H%M%S)"
  sudo mkdir -p "$BACKUP_DIR"
  sudo cp -r "$DEPLOY_DIR/.next" "$BACKUP_DIR/.next"
  sudo cp "$DEPLOY_DIR/server.js" "$BACKUP_DIR/server.js" 2>/dev/null || true

  # Prune old backups — keep only the 2 most recent
  ls -dt /opt/docorganiser/backups/*/ 2>/dev/null | tail -n +3 | xargs -r sudo rm -rf
fi

sudo rm -rf "$DEPLOY_DIR/.next" "$DEPLOY_DIR/server.js"
sudo cp -r .next/standalone/. "$DEPLOY_DIR/"
sudo cp -r .next/static "$DEPLOY_DIR/.next/static"
sudo cp -r public/. "$DEPLOY_DIR/public/" 2>/dev/null || true
sudo chown -R ec2-user:ec2-user "$DEPLOY_DIR/"

# ── 5. Restart and verify ──
sudo systemctl start docorganiser-frontend

sleep 5
if curl -sf -o /dev/null http://localhost:3000/login; then
  log "✅ Deploy complete — ${REMOTE_COMMIT:0:8} is live and healthy"
  echo "$REMOTE_COMMIT" | sudo tee "$COMMIT_FILE" > /dev/null
else
  log "⚠️  Frontend started but health check failed — check logs"
  echo "$REMOTE_COMMIT" | sudo tee "$COMMIT_FILE" > /dev/null
fi

# ── 6. Cleanup ──
rm -rf "$WORK_DIR"
log "Done"
