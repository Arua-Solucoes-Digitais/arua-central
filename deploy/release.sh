#!/usr/bin/env bash
# Runs ON THE VPS for each deploy (called by .github/workflows/deploy.yml over SSH).
#   release.sh <environment> <archive.tgz> <commit-sha>   install a new release
#   release.sh <environment> --rollback                   go back to the previous release
# Layout: /srv/arua-central/<environment>/{releases/<id>/.output, current -> releases/<id>, shared/{env,data,backups}}
set -euo pipefail

ENV_NAME="${1:?environment (staging|production)}"
ARG="${2:?archive path or --rollback}"
SHA="${3:-manual}"

case "$ENV_NAME" in staging | production) ;; *) echo "invalid environment: $ENV_NAME" >&2; exit 2 ;; esac

BASE="${ARUA_BASE:-/srv/arua-central}/$ENV_NAME"
RESTART_CMD="${ARUA_RESTART_CMD:-sudo /usr/bin/systemctl restart arua-central@$ENV_NAME}"
NODE_BIN="${ARUA_NODE_BIN:-node}"
KEEP_RELEASES=5
KEEP_BACKUPS=15

# shellcheck disable=SC1091
set -a && . "$BASE/shared/env" && set +a
PORT="${PORT:?PORT missing in $BASE/shared/env}"

log() { printf '[release %s] %s\n' "$ENV_NAME" "$*"; }

health() {
  for _ in $(seq 1 40); do
    if curl -fs -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null; then return 0; fi
    sleep 1
  done
  return 1
}

# Consistent copy of the SQLite database while the site keeps running.
backup_db() {
  local db="${ARUA_DB_PATH:-}"
  [ -n "$db" ] && [ -f "$db" ] || { log "no database yet, skipping backup"; return 0; }
  mkdir -p "$BASE/shared/backups"
  local out
  out="$BASE/shared/backups/arua-$(date -u +%Y%m%dT%H%M%SZ)-before-$SHA.db"
  "$NODE_BIN" --no-warnings - "$db" "$out" <<'JS'
const { DatabaseSync } = require("node:sqlite");
const [source, target] = process.argv.slice(-2);
const db = new DatabaseSync(source);
db.exec(`VACUUM INTO '${target.replaceAll("'", "''")}'`);
db.close();
JS
  chmod 600 "$out"
  log "database backup: $out"
  ls -1t "$BASE/shared/backups"/*.db 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f
}

switch_to() {
  ln -sfn "$1" "$BASE/current.tmp"
  mv -Tf "$BASE/current.tmp" "$BASE/current"
  $RESTART_CMD
}

mkdir -p "$BASE/releases"
previous="$(readlink "$BASE/current" 2>/dev/null || true)"

if [ "$ARG" = "--rollback" ]; then
  # Release folders are named by UTC timestamp, so name order is deploy order.
  target="$(ls -1d "$BASE"/releases/*/ 2>/dev/null | sed 's:/$::' | sort | awk -v cur="$previous" '$0 == cur { print prev; exit } { prev = $0 }')"
  [ -n "$target" ] || { log "no previous release to roll back to"; exit 1; }
  log "rolling back: $(basename "$previous") -> $(basename "$target")"
  switch_to "$target"
  health || { log "rolled-back release is not healthy either"; exit 1; }
  log "rollback OK"
  exit 0
fi

[ -f "$ARG" ] || { log "archive not found: $ARG"; exit 1; }
release="$BASE/releases/$(date -u +%Y%m%dT%H%M%SZ)-${SHA:0:7}"
mkdir -p "$release"
tar -xzf "$ARG" -C "$release"
[ -f "$release/.output/server/index.mjs" ] || { log "archive has no .output/server/index.mjs"; rm -rf "$release"; exit 1; }
rm -f "$ARG"

backup_db
log "switching to $(basename "$release")"
switch_to "$release"

if ! health; then
  log "health check FAILED on port $PORT"
  if [ -n "$previous" ]; then
    log "automatic rollback to $(basename "$previous")"
    switch_to "$previous"
    health && log "previous release restored" || log "previous release also unhealthy"
  fi
  rm -rf "$release"
  log "failed release removed"
  log "database was NOT restored automatically; latest backup is in $BASE/shared/backups"
  exit 1
fi

log "release OK: $(basename "$release")"
ls -1d "$BASE"/releases/*/ | sort | head -n -"$KEEP_RELEASES" | xargs -r rm -rf
