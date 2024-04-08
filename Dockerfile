FROM ubuntu:jammy-20240227

RUN apt update
RUN apt -y install wget python3.10 python3-pip
RUN ln -sf /usr/bin/python3.10 /usr/bin/python

# Install NodeJS - For Development
# RUN wget https://nodejs.org/dist/v20.12.1/node-v20.12.1.tar.gz
# RUN tar -xf node-v20.12.1.tar.gz
# RUN rm node-v20.12.1.tar.gz
# RUN ln -s /node-v20.12.1/bin/node /bin/node
# RUN ln -s /node-v20.12.1/bin/npm /bin/npm

# Copy CodeFree
COPY ./checker_modules/ /codefree/checker_modules
COPY ./output_modules/ /codefree/output_modules
COPY ./cf_args.py /codefree
COPY ./cf_checker.py /codefree
COPY ./cf_output.py /codefree
COPY ./codefree /codefree
COPY ./requirements.txt /codefree
RUN pip install -r /codefree/requirements.txt
RUN ln -sf /codefree/codefree /usr/bin/codefree

RUN mkdir /code # Prefer mounting your code directories under this directory