#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/opt/devops-test"
COMPOSE_FILE="${APP_DIR}/compose.yml"
BACKUP_FILE="${APP_DIR}/compose.yml.rollback-test-backup"
ENV_FILE="${APP_DIR}/.env"
PROJECT="devops-test"

HEALTH_URL="http://127.0.0.1:3000/health"
ROLLBACK_NEEDED=0

compose() {
    docker compose \
        --env-file "$ENV_FILE" \
        -f "$COMPOSE_FILE" \
        -p "$PROJECT" "$@"
}

wait_for_health() {
    local attempt

    for attempt in {1..30}; do
        if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
            return 0
        fi
        sleep 2
    done

    return 1
}

restore_configuration() {
    echo "ROLLBACK: Restoring original Compose configuration..."

    if [[ ! -f "$BACKUP_FILE" ]]; then
        echo "ERROR: Compose backup is missing."
        return 1
    fi

    cp -p "$BACKUP_FILE" "$COMPOSE_FILE"

    if ! compose up -d --no-deps api; then
        echo "ERROR: Could not recreate the original API."
        return 1
    fi

    if ! wait_for_health; then
        echo "ERROR: Original API did not become healthy."
        return 1
    fi

    rm -f "$BACKUP_FILE"
    echo "ROLLBACK SUCCESS: Original API is healthy."
}

handle_exit() {
    local exit_code=$?

    trap - EXIT
    set +e

    if [[ "$ROLLBACK_NEEDED" -eq 1 ]]; then
        echo "Unexpected exit. Attempting automatic rollback..."

        if restore_configuration; then
            ROLLBACK_NEEDED=0
        else
            echo "CRITICAL: Recovery needs manual attention."
            exit_code=1
        fi
    fi

    exit "$exit_code"
}

trap handle_exit EXIT

if [[ ! -f "$COMPOSE_FILE" || ! -f "$ENV_FILE" ]]; then
    echo "ERROR: Required deployment files are missing."
    exit 1
fi

if [[ -f "$BACKUP_FILE" ]]; then
    echo "ERROR: A Compose backup already exists. Inspect it first."
    exit 1
fi

echo "Checking original API health..."

if ! curl -fsS "$HEALTH_URL"; then
    echo
    echo "ERROR: Original API is unhealthy. Aborting."
    exit 1
fi

echo
echo "Saving original Compose configuration..."
cp -p "$COMPOSE_FILE" "$BACKUP_FILE"
ROLLBACK_NEEDED=1

echo "Changing only the API host port to 39001..."

if ! sed -i 's|127.0.0.1:3000:3000|127.0.0.1:39001:3000|' "$COMPOSE_FILE"; then
    echo "Could not modify Compose configuration."
    exit 1
fi

if ! grep -q '127.0.0.1:39001:3000' "$COMPOSE_FILE"; then
    echo "Expected temporary port mapping was not found."
    exit 1
fi

echo "Validating temporary Compose configuration..."
compose config --quiet

echo "Deploying temporary API configuration..."
compose up -d --no-deps api

echo "Checking original health URL..."

if wait_for_health; then
    echo "ERROR: Original port unexpectedly remained healthy."
    exit 2
fi

echo "EXPECTED FAILURE: Port 3000 is no longer serving the API."
echo "Automatic rollback is now starting..."

restore_configuration
ROLLBACK_NEEDED=0

echo
echo "AUTOMATIC ROLLBACK TEST PASSED."
echo "Original Compose configuration restored."
echo "Original API is healthy on port 3000."
