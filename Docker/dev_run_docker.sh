#!/bin/sh

CODEFREE_DIR=$(dirname `pwd`)
VERSION=$(cat ../VERSION)
IMAGE_TAG="codefree:$VERSION"

docker run --rm -it -p 8080:8080 \
    -e REACT_APP_SERVER_BASE_URL= \
    -e ENVIRONMENT=DEV \
    -e CHOKIDAR_USEPOLLING=true \
    -e WATCHPACK_POLLING=true \
    -v $CODEFREE_DIR:/codefree $IMAGE_TAG