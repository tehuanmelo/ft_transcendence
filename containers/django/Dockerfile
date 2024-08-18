FROM python:3.12

WORKDIR /usr/local/django

COPY tools/requirements.txt .

EXPOSE 8000

RUN python3 -m venv .venv && chmod +x .venv/bin/activate && \
    .venv/bin/activate && pip3 install -r requirements.txt

ENTRYPOINT ["sh", "-c", "python3 pong-backend/manage.py makemigrations && \
                         python3 pong-backend/manage.py migrate && \
                         exec python3 pong-backend/manage.py runserver 0.0.0.0:8000"]