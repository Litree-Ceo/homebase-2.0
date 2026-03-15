#!/bin/bash
# Overlord Dashboard Database Backup Script
# Backs up the SQLite database with rotation

set -e

BACKUP_DIR="${BACKUP_DIR:-../backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_PATH="${DB_PATH:-../overlord.db}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
echo "✓ Backup directory ready: $BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "✗ Database not found at: $DB_PATH"
    exit 1
fi

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/overlord_backup_$TIMESTAMP.db"

# Create backup
cp "$DB_PATH" "$BACKUP_FILE"
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✓ Backup created: $BACKUP_FILE ($SIZE)"

# Clean up old backups
DELETED=0
find "$BACKUP_DIR" -name "overlord_backup_*.db" -mtime +$RETENTION_DAYS -type f | while read -r file; do
    rm "$file"
    echo "✓ Removed old backup: $(basename "$file")"
    DELETED=$((DELETED + 1))
done

echo ""
echo "Backup Summary:"
echo "  - New backup: $BACKUP_FILE"
echo "  - Retention: $RETENTION_DAYS days"
echo "  - Old backups removed: $DELETED"
