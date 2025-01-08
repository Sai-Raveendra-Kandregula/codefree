#!/bin/sh

RUN_OPTIONS=$@

mkdir data || true

docker compose up $RUN_OPTIONS