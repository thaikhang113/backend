#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/thaikhang113/backend.git}"
APP_DIR="${APP_DIR:-/opt/backend}"
BRANCH="${BRANCH:-main}"

if [ ! -d "$APP_DIR/.git" ]; then
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
fi

if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
fi

if grep -q '^JWT_SECRET=your_jwt_secret_key_should_be_long_and_secure$' "$APP_DIR/.env"; then
  jwt_secret="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
  sed -i "s#^JWT_SECRET=.*#JWT_SECRET=${jwt_secret}#" "$APP_DIR/.env"
fi

chmod +x "$APP_DIR/deploy/update.sh"

install -m 0644 "$APP_DIR/deploy/backend-autodeploy.service" /etc/systemd/system/backend-autodeploy.service
install -m 0644 "$APP_DIR/deploy/backend-autodeploy.timer" /etc/systemd/system/backend-autodeploy.timer

systemctl daemon-reload
systemctl enable --now backend-autodeploy.timer
systemctl start backend-autodeploy.service
