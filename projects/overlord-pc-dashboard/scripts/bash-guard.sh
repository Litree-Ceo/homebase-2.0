#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# BASH SCRIPT GUARD & BEST PRACTICES TEMPLATE
# ══════════════════════════════════════════════════════════════════════════════
# Include this header in all bash scripts for proper error handling and logging.
#
# Usage:
#   1. Copy this to the top of your script (after the shebang)
#   2. Replace SCRIPT_NAME and USAGE_TEXT
#   3. Use log_info, log_error, log_warn, die for output
#   4. Use with `set -euo pipefail` for strict mode
#
# Features:
#   - Strict error handling (exit on error, undefined vars)
#   - Colored logging (info, warn, error)
#   - Exit cleanup (trap on EXIT)
#   - PID/state management
#   - Cross-platform path handling
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail
IFS=$'\n\t'

# Script metadata
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly ROOT_DIR="$(dirname "$SCRIPT_DIR")"
readonly SCRIPT_PID="$$"
readonly PID_FILE="${PID_FILE:-${TMPDIR:-/tmp}/${SCRIPT_NAME%.sh}.pid}"
readonly LOG_DIR="${LOG_DIR:-${ROOT_DIR}/logs}"
readonly LOG_FILE="${LOG_DIR}/${SCRIPT_NAME%.sh}.log"

# Logging levels
readonly LOG_LEVEL_DEBUG=0
readonly LOG_LEVEL_INFO=1
readonly LOG_LEVEL_WARN=2
readonly LOG_LEVEL_ERROR=3
LOG_LEVEL="${LOG_LEVEL:-$LOG_LEVEL_INFO}"

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NORMAL='\033[0m'

# ── Logging Functions ───────────────────────────────────────────────────────
log_debug() {
    [ "$LOG_LEVEL" -le $LOG_LEVEL_DEBUG ] && \
        echo -e "${BLUE}[DEBUG]${NORMAL} $(date '+%Y-%m-%d %H:%M:%S') :: $*" | tee -a "$LOG_FILE"
}

log_info() {
    [ "$LOG_LEVEL" -le $LOG_LEVEL_INFO ] && \
        echo -e "${GREEN}[INFO]${NORMAL}  $(date '+%Y-%m-%d %H:%M:%S') :: $*" | tee -a "$LOG_FILE"
}

log_warn() {
    [ "$LOG_LEVEL" -le $LOG_LEVEL_WARN ] && \
        echo -e "${YELLOW}[WARN]${NORMAL}  $(date '+%Y-%m-%d %H:%M:%S') :: $*" | tee -a "$LOG_FILE" >&2
}

log_error() {
    [ "$LOG_LEVEL" -le $LOG_LEVEL_ERROR ] && \
        echo -e "${RED}[ERROR]${NORMAL} $(date '+%Y-%m-%d %H:%M:%S') :: $*" | tee -a "$LOG_FILE" >&2
}

# ── Cleanup & Exit Functions ────────────────────────────────────────────────
cleanup() {
    local exit_code=$?
    if [ -f "$PID_FILE" ] && [ "$(cat "$PID_FILE" 2>/dev/null)" = "$SCRIPT_PID" ]; then
        rm -f "$PID_FILE"
        log_debug "Cleanup: Removed PID file"
    fi
    if [ $exit_code -ne 0 ]; then
        log_error "Script exited with code $exit_code"
    fi
}

die() {
    log_error "$*"
    exit 1
}

trap cleanup EXIT

# ── Initialization ──────────────────────────────────────────────────────────
init_script() {
    # Create log directory
    mkdir -p "$LOG_DIR" || die "Failed to create log directory: $LOG_DIR"
    
    # Write PID file (if not already running)
    if [ -f "$PID_FILE" ]; then
        local old_pid
        old_pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
        if kill -0 "$old_pid" 2>/dev/null; then
            die "Script already running with PID $old_pid"
        fi
    fi
    echo "$SCRIPT_PID" > "$PID_FILE" || die "Failed to write PID file"
    
    log_info "════════════════════════════════════════════════"
    log_info "Starting $SCRIPT_NAME (PID: $SCRIPT_PID)"
    log_info "Log file: $LOG_FILE"
    log_info "════════════════════════════════════════════════"
}

# ── Utility Functions ───────────────────────────────────────────────────────
check_command() {
    local cmd=$1
    if ! command -v "$cmd" &>/dev/null; then
        die "Required command not found: $cmd"
    fi
    log_debug "Found command: $cmd"
}

check_file() {
    local file=$1
    if [ ! -f "$file" ]; then
        die "Required file not found: $file"
    fi
    log_debug "Found file: $file"
}

check_dir() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        die "Required directory not found: $dir"
    fi
    log_debug "Found directory: $dir"
}

# ── Path Normalization ──────────────────────────────────────────────────────
to_absolute_path() {
    local path=$1
    if [[ "$path" = /* ]]; then
        echo "$path"
    else
        echo "$(cd "$(dirname "$path")" && pwd)/$(basename "$path")"
    fi
}

# ── Source this file in your script, then define main() ────────────────────
# Init happens automatically when this file is sourced
init_script
