FROM ubuntu:22.04

RUN apt update
RUN apt -y install curl wget python3.10 python3-pip apache2
RUN a2enmod rewrite
RUN ln -sf /usr/bin/python3.10 /usr/bin/python

# Copy CodeFree
COPY ./gui/ /codefree/gui
COPY ./checker_modules/ /codefree/checker_modules
COPY ./output_modules/ /codefree/output_modules
COPY ./cf_args.py /codefree
COPY ./cf_checker.py /codefree
COPY ./cf_output.py /codefree
COPY ./codefree /codefree
COPY ./requirements.txt /codefree
COPY ./docker-entrypoint.sh /codefree
RUN pip install -r /codefree/requirements.txt
RUN ln -sf /codefree/codefree /usr/bin/codefree

RUN mkdir /code # Prefer mounting your code directories under this directory

# COPY Apache Configuration
COPY ./apache2/apache2.conf /etc/apache2/
COPY ./apache2/ports.conf /etc/apache2/
COPY ./apache2/000-default.conf /etc/apache2/sites-available/
COPY ./apache2/001-frontend.conf /etc/apache2/sites-available/
RUN a2ensite 000-default.conf
RUN a2ensite 001-frontend.conf
RUN a2enmod proxy_http
RUN a2enmod proxy

# Install NodeJS - For Building React App
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs
WORKDIR /codefree/gui/frontend
RUN npm config set registry http://registry.npmjs.org/
RUN npm install --verbose
RUN npm run build
RUN apt-get purge -y nodejs
RUN rm -r /etc/apt/sources.list.d/nodesource.list && rm -r /etc/apt/keyrings/nodesource.gpg

RUN cp -rf /codefree/gui/frontend/build /var/www/html
COPY ./apache2/.htaccess /var/www/html/build

EXPOSE 8080

WORKDIR /codefree
ENTRYPOINT [ "/codefree/docker-entrypoint.sh" ]