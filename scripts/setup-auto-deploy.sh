#!/bin/bash
# ================================================================
# Setup script — installs the auto-deploy cron jobs on an EC2
# instance. Run this ONCE on each instance (or bake into AMI /
# User Data).
#
# Usage:
#   sudo bash setup-auto-deploy.sh frontend   # on frontend ASG instances
#   sudo bash setup-auto-deploy.sh backend    # on backend ASG instances
# ================================================================
set -euo pipefail

ROLE="${1:-}"
SCRIPTS_DIR="/opt/docorganiser/scripts"
LOG_DIR="/var/log/docorganiser"

if [[ "$ROLE" != "frontend" && "$ROLE" != "backend" ]]; then
  echo "Usage: $0 <frontend|backend>"
  echo "  frontend — installs the frontend auto-deploy cron"
  echo "  backend  — installs the backend auto-deploy cron"
  exit 1
fi

echo "Setting up auto-deploy for: $ROLE"

# 0. Install cronie if not present (Amazon Linux 2023 doesn't include it)
if ! command -v crontab &>/dev/null; then
  echo "Installing cronie..."
  dnf install -y cronie
  systemctl enable crond
  systemctl start crond
fi

# 1. Create directories
mkdir -p "$SCRIPTS_DIR" "$LOG_DIR"
chown -R ec2-user:ec2-user "$LOG_DIR"

# 2. Copy the deploy script
cp "$(dirname "$0")/auto-deploy-${ROLE}.sh" "$SCRIPTS_DIR/auto-deploy.sh"
chmod +x "$SCRIPTS_DIR/auto-deploy.sh"
chown ec2-user:ec2-user "$SCRIPTS_DIR/auto-deploy.sh"

# 3. Set up log rotation
cat > /etc/logrotate.d/docorganiser-deploy << 'LOGROTATE'
/var/log/docorganiser/auto-deploy.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 0644 ec2-user ec2-user
}
LOGROTATE

# 4. Record current deployed commit (so first cron run is a no-op)
REPO_URL="https://github.com/DreamerX00/Full-Stack-Project-DocumentOrganiser.git"
CURRENT=$(git ls-remote "$REPO_URL" refs/heads/master | awk '{print $1}')
echo "$CURRENT" > /opt/docorganiser/.current-commit
chown ec2-user:ec2-user /opt/docorganiser/.current-commit

# 5. Install cron job — every 5 minutes
CRON_LINE="*/5 * * * * /opt/docorganiser/scripts/auto-deploy.sh >> /var/log/docorganiser/auto-deploy.log 2>&1"
( crontab -u ec2-user -l 2>/dev/null | grep -v "auto-deploy" ; echo "$CRON_LINE" ) | crontab -u ec2-user -

echo ""
echo "✅ Auto-deploy cron installed for ec2-user"
echo "   Script:  $SCRIPTS_DIR/auto-deploy.sh"
echo "   Log:     $LOG_DIR/auto-deploy.log"
echo "   Commit:  ${CURRENT:0:8} (recorded as current)"
echo "   Schedule: every 5 minutes"
echo ""
echo "Verify with:  crontab -u ec2-user -l"
echo "View logs:    tail -f $LOG_DIR/auto-deploy.log"
