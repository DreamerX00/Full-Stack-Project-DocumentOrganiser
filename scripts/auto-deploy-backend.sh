#!/bin/bash
# =============================================================
# Auto-Deploy Backend — checks GitHub for new commits and
# rebuilds + restarts the Spring Boot JAR if changed.
# Designed to run as a cron job on ASG backend instances.
# =============================================================
set -euo pipefail

REPO_URL="https://github.com/DreamerX00/Full-Stack-Project-DocumentOrganiser.git"
BRANCH="master"
DEPLOY_DIR="/opt/docorganiser/app"
WORK_DIR="/tmp/auto-deploy-backend"
LOCK_FILE="/tmp/auto-deploy-backend.lock"
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

cd "$WORK_DIR/DocumentOrganiser-Backend"

./gradlew bootJar -x test >> "$LOG_FILE" 2>&1

JAR_FILE=$(find build/libs -name "*.jar" ! -name "*-plain.jar" | head -1)
if [ -z "$JAR_FILE" ]; then
  log "ERROR: Build succeeded but JAR not found — aborting"
  rm -rf "$WORK_DIR"
  exit 1
fi

log "Build successful ($JAR_FILE) — deploying..."

# ── 4. Deploy ──
sudo systemctl stop docorganiser-backend || true

# Back up current JAR
if ls "$DEPLOY_DIR"/*.jar 1>/dev/null 2>&1; then
  BACKUP_DIR="/opt/docorganiser/backups/$(date +%Y%m%d-%H%M%S)"
  sudo mkdir -p "$BACKUP_DIR"
  sudo cp "$DEPLOY_DIR"/*.jar "$BACKUP_DIR/"

  # Prune old backups — keep only the 2 most recent
  ls -dt /opt/docorganiser/backups/*/ 2>/dev/null | tail -n +3 | xargs -r sudo rm -rf
fi

sudo rm -f "$DEPLOY_DIR"/*.jar
sudo cp "$JAR_FILE" "$DEPLOY_DIR/backend.jar"
sudo chown -R ec2-user:ec2-user "$DEPLOY_DIR/"

# ── 5. Restart and verify ──
sudo systemctl start docorganiser-backend

# Wait for Spring Boot to start (can take 20-30s)
log "Waiting for backend to start..."
for i in $(seq 1 12); do
  sleep 5
  if curl -sf -o /dev/null http://localhost:8080/api/v1/actuator/health; then
    log "✅ Deploy complete — ${REMOTE_COMMIT:0:8} is live and healthy"
    echo "$REMOTE_COMMIT" | sudo tee "$COMMIT_FILE" > /dev/null
    rm -rf "$WORK_DIR"
    log "Done"
    exit 0
  fi
done

log "⚠️  Backend started but health check failed after 60s — check logs"
echo "$REMOTE_COMMIT" | sudo tee "$COMMIT_FILE" > /dev/null

# ── 6. Cleanup ──
rm -rf "$WORK_DIR"
log "Done"
