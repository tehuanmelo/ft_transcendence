FROM python:3.12-slim-bullseye

ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/local/django

COPY tools/requirements.txt .

EXPOSE 8000

RUN pip install -r requirements.txt

ENTRYPOINT ["sh", "-c", "python3 pong-backend/manage.py makemigrations && \
                         python3 pong-backend/manage.py migrate && \
                         exec python3 pong-backend/manage.py runserver 0.0.0.0:8000"]