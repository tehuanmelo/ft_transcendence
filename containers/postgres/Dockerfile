
# TODO use a volume ref(19.2.1 postgreSQL docs)
# TODO use a config file
# TODO docker-compose and env variables
# TODO security of the database cluster
# TODO sort out hosts better

FROM alpine:3.19

# Working Directory
WORKDIR /usr/local/postgresql

# Install PostgreSQL
RUN apk update && apk add --no-cache postgresql

# Copy the PostgreSQL initialization script
COPY tools tools

# Run the PostgreSQL initialization script
RUN chmod +x ./tools/*.sh && ./tools/setup.sh

# Expose the PostgreSQL port
EXPOSE 5432

# Start the PostgreSQL server
ENTRYPOINT [ "./tools/run.sh" ]
