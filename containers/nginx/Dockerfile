FROM alpine:3.19

WORKDIR /usr/local/nginx/

COPY tools/setup.sh .

RUN chmod +x setup.sh && ./setup.sh \
    && mkdir logs && touch logs/error.log

COPY pong.conf /etc/nginx/http.d

EXPOSE 443

# CMD tail -f /dev/null
CMD ["nginx", "-g", "daemon off;"]