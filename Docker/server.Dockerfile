FROM python:3.11.11-slim-bookworm

ENV IN_DOCKER=true

RUN apt update
RUN apt -y install software-properties-common gettext

# Copy CodeFree
COPY ./ /codefree/
RUN pip install --break-system-packages -r /codefree/requirements.txt
RUN ln -sf /codefree/codefree /usr/bin/codefree

RUN mkdir /code # Prefer mounting your code directories under this directory

EXPOSE 8000

WORKDIR /codefree
ENTRYPOINT [ "/codefree/Docker/entrypoint.sh" ]