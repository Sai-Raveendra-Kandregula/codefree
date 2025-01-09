#!/usr/bin/env bash

PWD=$(pwd)
cd /codefree/modules/server
alembic upgrade head
cd $PWD