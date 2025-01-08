FROM python:3.11.11-slim-bookworm

ENV IN_DOCKER=true
RUN apt update && apt install -y git libpcre3 gettext && apt -y autoremove && apt -y clean
RUN pip install --upgrade pip

# Copy CodeFree
COPY ./modules/ /codefree/modules/
COPY ./main.py /codefree/
COPY ./codefree /codefree/
COPY ./requirements.txt /codefree/
COPY ./Docker/entrypoint.sh /codefree/

RUN pip install -r /codefree/requirements.txt
RUN ln -sf /codefree/codefree /usr/bin/codefree

RUN mkdir /code # Prefer mounting your code directories under this directory

EXPOSE 8000

WORKDIR /codefree
CMD [ "/codefree/entrypoint.sh" ]