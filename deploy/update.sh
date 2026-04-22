#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/backend}"
BRANCH="${BRANCH:-main}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

cd "$REPO_DIR"

git fetch origin "$BRANCH"

local_head="$(git rev-parse HEAD)"
remote_head="$(git rev-parse "origin/$BRANCH")"
app_container="$(docker-compose -f "$COMPOSE_FILE" ps -q app || true)"

if [ "$local_head" = "$remote_head" ] && [ -n "$app_container" ]; then
  exit 0
fi

if [ "$local_head" != "$remote_head" ]; then
  git pull --ff-only origin "$BRANCH"
fi

docker-compose -f "$COMPOSE_FILE" rm -sf app || true
docker-compose -f "$COMPOSE_FILE" up -d --build
