FROM node:22-bookworm-slim

RUN apt update
RUN apt -y install software-properties-common curl wget apache2
RUN a2enmod rewrite
RUN a2enmod proxy_http
RUN a2enmod proxy

# Copy CodeFree
COPY ./frontend /codefree_ui

# Install Frontend Dependencies
RUN rm -rf /codefree_ui/node_modules || true
RUN yarn --cwd /codefree_ui

COPY ./Docker/apache2_ui/apache2.conf /etc/apache2/
COPY ./Docker/apache2_ui/ports.conf /etc/apache2/
COPY ./Docker/apache2_ui/000-default.conf /etc/apache2/sites-available

COPY ./Docker/ui_entrypoint.sh /

WORKDIR /codefree
ENTRYPOINT [ "/ui_entrypoint.sh" ]