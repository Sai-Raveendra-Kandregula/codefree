#!/bin/sh

cd /codefree/modules/server
alembic upgrade head

cd /codefree
/codefree/main.py