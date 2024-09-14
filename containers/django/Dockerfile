FROM python:3.12-alpine

ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/local/django

COPY requirements.txt ./tools/entrypoint.sh ./

EXPOSE 8000

RUN pip install --root-user-action=ignore -r requirements.txt --no-cache-dir && chmod +x ./entrypoint.sh


ENTRYPOINT ["./entrypoint.sh"]

CMD ["python3", "pong-backend/manage.py", "runserver", "0.0.0.0:8000"]
