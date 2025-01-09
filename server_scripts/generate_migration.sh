#!/usr/bin/env bash

PWD=$(pwd)
cd /codefree/modules/server
alembic revision --autogenerate -m "$1"
cd $PWD