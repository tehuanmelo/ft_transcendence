# ------------------- postgres database for use with django ------------------ #
DB_NAME='pgdb'
DB_USR='django'
DB_PASS='django-pass'
# ------------------------ cluster and log directories ----------------------- #
PARENT_DIR='/usr/local/postgresql'
DATA_DIR='/usr/local/postgresql/data'
LOG_DIR='/usr/local/postgresql/logs'
LOG_INIT='/usr/local/postgresql/logs/init.log'
LOG_POSTGRES='postgreSQL.log'
# -------------------------------- config file ------------------------------- #
CONFIG_FILE='/usr/local/postgresql/data/postgresql.conf'
HBA_FILE='/usr/local/postgresql/data/pg_hba.conf'
# ---------------- lock directory to allow for socket binding ---------------- #
LOCK_DIR='/run/postgresql'

# ------------------ default postgres user for initial setup ----------------- #
PSQL_USR='postgres'

# Function to log a message with a timestamp to a specified file.
# Arguments:
#   $1: The message to be logged.
#   $2: The file to log the message to.
log_message() {
    local message="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")

    echo "$timestamp - $message" >> $2
}

# Runs a command as the postgres user.
# Arguments:
#   - command: The command to be executed.
run_as_postgres() {
    local command="$1"

    su $PSQL_USR -c "$1"
}

# Function: psql_u
# Description: Executes a PostgreSQL command as a postgres default user.
# Arguments:
#   - command: The PostgreSQL command to execute.
psql_u() {
    local command="$1"
    psql -U $PSQL_USR -d $DB_NAME -c "$command"
}

# ---------------------------------------------------------------------------- #
#                 Security of the database cluster                             #
# ---------------------------------------------------------------------------- #
# Note that enabling or disabling group access on an existing cluster requires the cluster to be shut down
# and the appropriate mode to be set on all directories and files before restarting PostgreSQL. Otherwise,
# a mix of modes might exist in the data directory. For clusters that allow access only by the owner, the
# appropriate modes are 0700 for directories and 0600 for files. For clusters that also allow reads by
# the group, the appropriate modes are 0750 for directories and 0640 for files.
# However, while the directory contents are secure, the default client authentication setup allows any
# local user to connect to the database and even become the database superuser. If you do not trust
# other local users, we recommend you use one of initdb's -W, --pwprompt or --pwfile options
# to assign a password to the database superuser. Also, specify -A scram-sha-256 so that the
# default trust authentication mode is not used; or modify the generated pg_hba.conf file after
# running initdb, but before you start the server for the first time. (Other reasonable approaches
# include using peer authentication or file system permissions to restrict connections. See Chapter 21
# for more information.)
