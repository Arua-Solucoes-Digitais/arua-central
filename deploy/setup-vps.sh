#!/usr/bin/env bash
# Prepares a fresh Ubuntu 24.04 LTS VPS for Aruá Central. Run ONCE, as root, on the server:
#
#   sudo bash setup-vps.sh --domain arua.com.br --staging-domain homologacao.arua.com.br \
#        --deploy-key "ssh-ed25519 AAAA... github-actions-arua"
#
# Installs Node 22 LTS (official build, checksum verified), Caddy (automatic HTTPS), firewall
# and automatic security updates; creates user "arua", folders, systemd services and the
# limited sudo rule the deploy needs. Safe to re-run: it never touches existing data or env files.
# It does NOT change DNS: point the domains (A/AAAA records) to this server yourself.
set -euo pipefail

DOMAIN=""
STAGING_DOMAIN=""
DEPLOY_KEY=""
NODE_MAJOR=22
REPO_RAW="https://raw.githubusercontent.com/Arua-Solucoes-Digitais/arua-central/main/deploy/systemd"

while [ $# -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2 ;;
    --staging-domain) STAGING_DOMAIN="$2"; shift 2 ;;
    --deploy-key) DEPLOY_KEY="$2"; shift 2 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

[ "$(id -u)" = 0 ] || { echo "run as root (sudo)" >&2; exit 1; }
[ -n "$DOMAIN" ] || { echo "--domain is required" >&2; exit 2; }
[ -n "$DEPLOY_KEY" ] || { echo "--deploy-key is required (public key used by GitHub Actions)" >&2; exit 2; }
. /etc/os-release
[ "${ID:-}" = ubuntu ] || echo "warning: tested for Ubuntu 24.04, found ${PRETTY_NAME:-unknown}"

step() { printf '\n==> %s\n' "$*"; }

step "System packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q curl ca-certificates xz-utils caddy ufw unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

step "Node.js $NODE_MAJOR (official binary, verified)"
ARCH="$(uname -m)"; case "$ARCH" in x86_64) NARCH=x64 ;; aarch64) NARCH=arm64 ;; *) echo "unsupported CPU: $ARCH" >&2; exit 1 ;; esac
BASE_URL="https://nodejs.org/dist/latest-v${NODE_MAJOR}.x"
TMP="$(mktemp -d)"
curl -fsSL "$BASE_URL/SHASUMS256.txt" -o "$TMP/SHASUMS256.txt"
FILE="$(grep -oE "node-v[0-9.]+-linux-${NARCH}\.tar\.xz" "$TMP/SHASUMS256.txt" | head -n1)"
curl -fsSL "$BASE_URL/$FILE" -o "$TMP/$FILE"
(cd "$TMP" && grep " $FILE\$" SHASUMS256.txt | sha256sum -c -)
rm -rf /opt/node && mkdir -p /opt/node
tar -xJf "$TMP/$FILE" -C /opt/node --strip-components=1
ln -sfn /opt/node/bin/node /usr/local/bin/node
rm -rf "$TMP"
node --version

step "User and folders"
id arua >/dev/null 2>&1 || useradd --system --create-home --home-dir /srv/arua-central --shell /bin/bash arua
install -d -m 700 -o arua -g arua /srv/arua-central/.ssh
KEYS=/srv/arua-central/.ssh/authorized_keys
touch "$KEYS"
grep -qxF "restrict $DEPLOY_KEY" "$KEYS" || echo "restrict $DEPLOY_KEY" >> "$KEYS"
chown arua:arua "$KEYS" && chmod 600 "$KEYS"

setup_env() {
  local env="$1" port="$2" dir="/srv/arua-central/$1"
  install -d -m 750 -o arua -g arua "$dir" "$dir/releases" "$dir/shared"
  install -d -m 700 -o arua -g arua "$dir/shared/data" "$dir/shared/backups"
  if [ ! -f "$dir/shared/env" ]; then
    cat > "$dir/shared/env" <<EOF
HOST=127.0.0.1
PORT=$port
ARUA_DB_PATH=$dir/shared/data/arua.db
ARUA_UPLOADS_DIR=$dir/shared/data/uploads
ARUA_TRUST_PROXY=1
EOF
    chown arua:arua "$dir/shared/env" && chmod 600 "$dir/shared/env"
  fi
}
setup_env production 8080
[ -n "$STAGING_DOMAIN" ] && setup_env staging 8081

step "systemd services"
for unit in arua-central@.service arua-central-status@.service arua-central-status@.timer; do
  if [ -f "$(dirname "$0")/systemd/$unit" ]; then
    install -m 644 "$(dirname "$0")/systemd/$unit" "/etc/systemd/system/$unit"
  else
    curl -fsSL "$REPO_RAW/$unit" -o "/etc/systemd/system/$unit"
  fi
done
systemctl daemon-reload
ENVS="production"; [ -n "$STAGING_DOMAIN" ] && ENVS="production staging"
for env in $ENVS; do
  systemctl enable "arua-central@$env" "arua-central-status@$env.timer"
done

step "Limited sudo for deploys (restart only)"
RULE="arua ALL=(root) NOPASSWD:"
for env in $ENVS; do RULE="$RULE /usr/bin/systemctl restart arua-central@$env,"; done
echo "${RULE%,}" > /etc/sudoers.d/arua-deploy
chmod 440 /etc/sudoers.d/arua-deploy
visudo -cf /etc/sudoers.d/arua-deploy

step "Admin helper: arua-admin <environment>"
cat > /usr/local/bin/arua-admin <<'EOF'
#!/usr/bin/env bash
# Creates or resets an administrator: sudo arua-admin production
set -euo pipefail
env="${1:-production}"
exec sudo -u arua bash -c "set -a; . /srv/arua-central/$env/shared/env; set +a; cd /srv/arua-central/$env/current && node --no-warnings scripts/admin.ts"
EOF
chmod 755 /usr/local/bin/arua-admin

step "Caddy (HTTPS)"
{
  echo "$DOMAIN {"
  echo "  encode zstd gzip"
  echo "  reverse_proxy 127.0.0.1:8080"
  echo "}"
  if [ -n "$STAGING_DOMAIN" ]; then
    echo ""
    echo "$STAGING_DOMAIN {"
    echo "  encode zstd gzip"
    echo "  header X-Robots-Tag \"noindex, nofollow\""
    echo "  reverse_proxy 127.0.0.1:8081"
    echo "}"
  fi
} > /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl reload caddy || systemctl restart caddy

step "Firewall"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

step "Done"
cat <<EOF
Next steps:
  1. DNS: point $DOMAIN${STAGING_DOMAIN:+ and $STAGING_DOMAIN} to this server's IP (A/AAAA records).
  2. GitHub: run the "Deploy" workflow (staging first, then production with approval).
  3. After the first deploy: sudo arua-admin production   (creates your login)
  4. Backups: copy /srv/arua-central/*/shared/ off the server regularly.
EOF
