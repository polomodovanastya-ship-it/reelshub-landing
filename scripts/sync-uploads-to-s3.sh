#!/usr/bin/env bash
# Sync Directus local uploads → Timeweb S3 and retarget DB rows.
#
# Run on the VPS from the repo root:
#   chmod +x scripts/sync-uploads-to-s3.sh
#   ./scripts/sync-uploads-to-s3.sh
#
# Requires: docker, .env.prod with STORAGE_S3_* and STORAGE_LOCATIONS=s3

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.prod}"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE")

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${STORAGE_S3_KEY:?set STORAGE_S3_KEY in $ENV_FILE}"
: "${STORAGE_S3_SECRET:?set STORAGE_S3_SECRET in $ENV_FILE}"
: "${STORAGE_S3_BUCKET:?set STORAGE_S3_BUCKET in $ENV_FILE}"
: "${STORAGE_S3_ENDPOINT:?set STORAGE_S3_ENDPOINT in $ENV_FILE}"

UPLOADS_DIR="${UPLOADS_DIR:-$ROOT/directus/uploads}"
REGION="${STORAGE_S3_REGION:-ru-1}"
ENDPOINT="${STORAGE_S3_ENDPOINT}"
BUCKET="${STORAGE_S3_BUCKET}"
# Optional prefix inside the bucket (must match STORAGE_S3_ROOT if you set one)
ROOT_PREFIX="${STORAGE_S3_ROOT:-}"

if [[ ! -d "$UPLOADS_DIR" ]]; then
  echo "Uploads dir not found: $UPLOADS_DIR"
  exit 1
fi

FILE_COUNT=$(find "$UPLOADS_DIR" -type f ! -name '.gitkeep' ! -name '.*' | wc -l | tr -d ' ')
echo "Found $FILE_COUNT file(s) in $UPLOADS_DIR"
if [[ "$FILE_COUNT" == "0" ]]; then
  echo "Nothing to sync."
  exit 0
fi

S3_URI="s3://${BUCKET}/"
if [[ -n "$ROOT_PREFIX" ]]; then
  S3_URI="s3://${BUCKET}/${ROOT_PREFIX%/}/"
fi

echo "→ Sync to ${S3_URI} via ${ENDPOINT}"

docker run --rm \
  -e AWS_ACCESS_KEY_ID="$STORAGE_S3_KEY" \
  -e AWS_SECRET_ACCESS_KEY="$STORAGE_S3_SECRET" \
  -e AWS_DEFAULT_REGION="$REGION" \
  -v "$UPLOADS_DIR:/data:ro" \
  amazon/aws-cli:2.17.16 \
  s3 sync /data "$S3_URI" \
    --endpoint-url "$ENDPOINT" \
    --only-show-errors

echo "→ Point Directus file rows at storage=s3"
DB_USER_VAL="${DB_USER:-directus}"
DB_NAME_VAL="${DB_DATABASE:-directus}"

"${COMPOSE[@]}" exec -T postgres \
  psql -U "$DB_USER_VAL" -d "$DB_NAME_VAL" -v ON_ERROR_STOP=1 <<'SQL'
UPDATE directus_files
SET storage = 's3'
WHERE storage IS DISTINCT FROM 's3';
SELECT storage, count(*) FROM directus_files GROUP BY storage ORDER BY 1;
SQL

echo "→ Restart Directus (ensure STORAGE_LOCATIONS=s3 in $ENV_FILE)"
"${COMPOSE[@]}" up -d directus

echo "Done. Smoke-test: open cms File Library and /assets/{id} for an existing file."
