FROM ubuntu:22.04

ENV IN_DOCKER=true

RUN apt update
RUN apt -y install curl wget python3.10 python3-pip apache2 gettext
RUN a2enmod rewrite
RUN ln -sf /usr/bin/python3.10 /usr/bin/python

# Copy CodeFree
COPY ./ /codefree/
RUN pip install -r /codefree/requirements.txt
RUN ln -sf /codefree/codefree /usr/bin/codefree

RUN mkdir /code # Prefer mounting your code directories under this directory

# COPY Apache Configuration
COPY ./Docker/apache2/apache2.conf /etc/apache2/
COPY ./Docker/apache2/ports.conf.prod /etc/apache2/
COPY ./Docker/apache2/ports.conf.dev /etc/apache2/
COPY ./Docker/apache2/000-default.template.conf /etc/apache2/sites-available/
COPY ./Docker/apache2/001-frontend.conf /etc/apache2/sites-available/
RUN a2ensite 000-default.conf
RUN a2enmod proxy_http
RUN a2enmod proxy

# Install NodeJS - For Building Frontend
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs
RUN npm install --global yarn
RUN rm -rf /codefree/frontend/node_modules || true
RUN yarn --cwd /codefree/frontend

EXPOSE 8080

WORKDIR /codefree
ENTRYPOINT [ "/codefree/Docker/entrypoint.sh" ]