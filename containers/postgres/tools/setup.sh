#!/bin/sh

# ---------------------------- source common file ---------------------------- #
. ./tools/common.sh

# --------------------------- create data directory -------------------------- #
mkdir -p $PARENT_DIR && chown -R $PSQL_USR:$PSQL_USR $PARENT_DIR

# ----------------- give lock priveleges to the postgres_user ---------------- #
mkdir $LOCK_DIR && chown $PSQL_USR:$PSQL_USR $LOCK_DIR

# ------ create log directory and give permissions to the postgres user ------ #
mkdir -p $LOG_DIR && chown $PSQL_USR:$PSQL_USR $LOG_DIR

# -------------------------- Init the data directory ------------------------- #

if [ ! -d $DATA_DIR ]; then
    run_as_postgres "initdb -D $DATA_DIR >$LOG_INIT 2>&1"
    log_message "Data directory created" $LOG_INIT
else
    log_message "Data directory already exists" $LOG_INIT
    exit 1
fi

# -- Update listen_addresses in postgresql.conf to listen on all interfaces -- #
sed -i "s/^#\?listen_addresses\s*=\s*'.*'/listen_addresses = '*'/" $CONFIG_FILE

