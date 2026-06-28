#!/bin/sh

# Configuration
BACKUP_DIR="/app/backups"
DB_FILE="/app/prisma/dev.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sqlite"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

# SQLite Safe Online Backup using CLI
if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"
  echo "[Backup] Online SQLite backup successful: $BACKUP_FILE"
else
  # Fallback file copy
  cp "$DB_FILE" "$BACKUP_FILE"
  echo "[Backup] File copy backup successful: $BACKUP_FILE"
fi

# Gzip compress the backup file
gzip "$BACKUP_FILE"
echo "[Backup] Compression complete: $BACKUP_FILE.gz"

# Rotate backups: delete backups older than retention days
find "$BACKUP_DIR" -name "db_backup_*.gz" -mtime +$RETENTION_DAYS -delete
echo "[Backup] Backup rotation complete."
