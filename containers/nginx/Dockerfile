FROM alpine:3.19

WORKDIR /var/lib/nginx/

RUN apk add --update --no-cache openssl ca-certificates nginx

RUN mkdir /etc/nginx/certs && cd /etc/nginx/certs && \
    openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
    -out /etc/nginx/certs/test.crt \
    -keyout /etc/nginx/certs/key.key \
    -subj "/C=US/CN=pong.com"

COPY pong.conf /etc/nginx/http.d

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]