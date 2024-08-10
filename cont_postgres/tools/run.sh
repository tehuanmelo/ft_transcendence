#!/bin/sh

# ---------------------------- source common file ---------------------------- #
. ./tools/common.sh
DJ_HOST='django_container.pong-bridge'
# ------------------------ add DB_USER to pg_hba.conf ------------------------ #
if ! grep -Fxq "host  $DB_NAME    $DB_USR     $DJ_HOST    md5" "$HBA_FILE" ; then
    echo "host  $DB_NAME    $DB_USR     $DJ_HOST    md5" >> $HBA_FILE
else
    log_message "$DJ_HOST already exists in $HBA_FILE" $LOG_INIT
fi

echo "host  $DB_NAME    $DB_USR     172.21.0.1/24    md5" >> $HBA_FILE

# ------------------------ Start the postgres server ------------------------ #
run_as_postgres "postgres -D $DATA_DIR >>$LOG_DIR/$LOG_POSTGRES 2>&1" &

# ---------------------- sleep to allow server to start ---------------------- #
sleep 3

# --------------------------------- Create db -------------------------------- #
run_as_postgres "createdb -U $PSQL_USR $DB_NAME >$LOG_INIT 2>&1"

# ------------------------- Grant all privileges ---------------------------- #
psql_u "CREATE USER $DB_USR WITH PASSWORD '$DB_PASS' CREATEDB;"
psql_u "ALTER DATABASE $DB_NAME OWNER TO $DB_USR;"
psql_u "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USR;"

# ------------------- restart the server in the foreground ------------------- #

run_as_postgres "pg_ctl -D $DATA_DIR stop >>$LOG_DIR/$LOG_POSTGRES 2>&1"
run_as_postgres "postgres -D $DATA_DIR >>$LOG_DIR/$LOG_POSTGRES 2>&1"