#!/bin/sh

CODEFREE_DIR=$(dirname `pwd`)
VERSION=$(cat ../VERSION)
IMAGE_TAG="codefree:$VERSION"

RUN_OPTIONS=$@

echo $RUN_OPTIONS

docker run --rm -it \
    -p 8080:8080 \
    -p 3000:3000 \
    -p 9000:9000 \
    --env-file .env \
    -e ENVIRONMENT=DEV \
    -e CHOKIDAR_USEPOLLING=true \
    -e WATCHPACK_POLLING=true \
    $RUN_OPTIONS \
    -v $CODEFREE_DIR:/codefree $IMAGE_TAG