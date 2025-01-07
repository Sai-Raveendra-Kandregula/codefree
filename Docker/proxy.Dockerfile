FROM debian:bookworm-slim

RUN apt update
RUN apt -y install software-properties-common apache2 gettext

# COPY Apache Configuration
COPY ./Docker/apache2/ports.conf /etc/apache2/
COPY ./Docker/apache2/000-default.conf /etc/apache2/sites-available/
RUN a2ensite 000-default.conf
RUN a2enmod rewrite
RUN a2enmod proxy_http
RUN a2enmod proxy

EXPOSE 8080

CMD [ "apache2ctl", "-D", "FOREGROUND" ]