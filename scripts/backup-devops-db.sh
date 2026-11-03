#!/bin/bash
set -Eeuo pipefail

BUCKET="devops-final-project-db-backups-788516091241"
BACKUP_DIR="/home/ubuntu/devops-backups"
CONTAINER="devops-app-db-1"
DATABASE="devopsdb"
DB_USER="appuser"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/devopsdb-${TIMESTAMP}.dump"
S3_KEY="postgres/$(basename "$BACKUP_FILE")"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
umask 077

echo "Starting PostgreSQL backup: $TIMESTAMP"

# Create a PostgreSQL custom-format backup.
docker exec "$CONTAINER" \
  pg_dump -U "$DB_USER" -d "$DATABASE" -Fc \
  > "$BACKUP_FILE"

# Ensure the backup is nonempty and readable by pg_restore.
test -s "$BACKUP_FILE"
docker exec -i "$CONTAINER" \
  pg_restore --list < "$BACKUP_FILE" > /dev/null

echo "Backup archive validated."

# Upload to S3 with server-side encryption.
aws s3 cp "$BACKUP_FILE" \
  "s3://${BUCKET}/${S3_KEY}" \
  --sse AES256

# Verify the uploaded object size.
LOCAL_SIZE="$(stat -c '%s' "$BACKUP_FILE")"
S3_SIZE="$(aws s3api head-object \
  --bucket "$BUCKET" \
  --key "$S3_KEY" \
  --query 'ContentLength' \
  --output text)"

if [ "$LOCAL_SIZE" != "$S3_SIZE" ]; then
  echo "ERROR: Local and S3 sizes do not match." >&2
  exit 1
fi

echo "SUCCESS: Backup uploaded and verified."
echo "S3 object: s3://${BUCKET}/${S3_KEY}"
echo "Size: ${S3_SIZE} bytes"
