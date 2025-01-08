#!/bin/sh

RUN_OPTIONS=$@

mkdir data || true

rm -f docker-compose.dev.yml || true
cp docker-compose.yml docker-compose.dev.yml
sed -i 's|# - ./|- ./|g' docker-compose.dev.yml
ENVIRONMENT=DEV docker compose --file ./docker-compose.dev.yml up $RUN_OPTIONS