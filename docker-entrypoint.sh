#!/bin/sh

service apache2 start || exit 1
echo "Apache Webserver Running on 0.0.0.0:8080"

python3 /codefree/gui/main.py