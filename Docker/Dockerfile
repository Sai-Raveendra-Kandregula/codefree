FROM node:22-bookworm-slim

ENV IN_DOCKER=true

RUN apt update
RUN apt -y install software-properties-common
RUN apt update
RUN apt -y install curl wget python3.11 python3-pip apache2 gettext

# Copy CodeFree
COPY ./ /codefree/
RUN pip install --break-system-packages -r /codefree/requirements.txt
RUN ln -sf /codefree/codefree /usr/bin/codefree

RUN mkdir /code # Prefer mounting your code directories under this directory

# COPY Apache Configuration
COPY ./Docker/apache2/apache2.conf /etc/apache2/
COPY ./Docker/apache2/ports.conf.prod /etc/apache2/
COPY ./Docker/apache2/ports.conf.dev /etc/apache2/
COPY ./Docker/apache2/000-default.template.conf /etc/apache2/sites-available/
COPY ./Docker/apache2/000-default.template.dev.conf /etc/apache2/sites-available/
COPY ./Docker/apache2/001-frontend.conf /etc/apache2/sites-available/
RUN a2ensite 000-default.conf
RUN a2enmod rewrite
RUN a2enmod proxy_http
RUN a2enmod proxy

# Install Frontend Dependencies
RUN rm -rf /codefree/frontend/node_modules || true
RUN yarn --cwd /codefree/frontend

EXPOSE 8080

WORKDIR /codefree
ENTRYPOINT [ "/codefree/Docker/entrypoint.sh" ]