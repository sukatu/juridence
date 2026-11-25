#!/usr/bin/env bash
set -u

BASE=${JURIDENCE_BASE:-/home/master/applications/jrfhpqjbjp/private_html/juridence}
RUNTIME="$BASE/runtime"
PGROOT="$RUNTIME/postgresql"
PGDATA="$RUNTIME/postgres-data"
LOGS="$RUNTIME/logs"
BACKEND="$BASE/backend"
mkdir -p "$LOGS"

exec 9>"$RUNTIME/services.lock"
flock -n 9 || exit 0

set -a
. "$BACKEND/.env"
set +a
export PGPASSWORD="$POSTGRES_PASSWORD"

database_ready() {
  "$PGROOT/bin/psql" -w -h 127.0.0.1 -p 55432 -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -tAc 'SELECT 1' >/dev/null 2>&1
}

if ! database_ready; then
  if "$PGROOT/bin/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
    "$PGROOT/bin/pg_ctl" -D "$PGDATA" stop -m fast || exit 1
  fi
  "$PGROOT/bin/pg_ctl" -D "$PGDATA" -l "$LOGS/postgres.log" start || exit 1
  for _ in $(seq 1 30); do
    database_ready && break
    sleep 1
  done
  database_ready || exit 1
fi

if ! curl -fsS --max-time 4 http://127.0.0.1:8000/health >/dev/null 2>&1; then
  if ! pgrep -f "$RUNTIME/venv/bin/uvicorn main:app.*--port 8000" >/dev/null 2>&1; then
    cd "$BACKEND" || exit 1
    # Do not let the long-running API inherit the watchdog's flock descriptor.
    nohup "$RUNTIME/venv/bin/uvicorn" main:app --host 127.0.0.1 --port 8000 9>&- >> "$LOGS/api.log" 2>&1 < /dev/null &
  fi
fi
