FROM ubuntu:jammy-20240227

RUN apt update
RUN apt -y install curl wget python3.10 python3-pip apache2
RUN a2enmod rewrite
RUN ln -sf /usr/bin/python3.10 /usr/bin/python

# Install NodeJS - For Development
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

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
COPY ./apache2/000-default.conf /etc/apache2/sites-available/

WORKDIR /codefree/gui/frontend
RUN npm install
RUN npm run build

WORKDIR /codefree
ENTRYPOINT [ "/codefree/docker-entrypoint.sh" ]