#!/bin/sh

# install dependencies
apk add --update --no-cache openssl curl ca-certificates nginx

#! create an ssl certificate [should be signed properly???]
mkdir /etc/nginx/certs && cd /etc/nginx/certs && \
openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out /etc/nginx/certs/test.crt \
	-keyout /etc/nginx/certs/key.key -subj "/C=US/ST=None/L=AbuDhabi/O=Certifie/CN=pong.com"
