#!/bin/sh

VERSION=$(cat VERSION)
IMAGE_TAG="codefree:$VERSION"

echo "Running codefree v$VERSION in developer mode..."

docker run --rm -it -p 8080:8080 -p 3000:3000 \
    -e REACT_APP_SERVER_BASE_URL= \
    -e ENVIRONMENT=DEV \
    -e CHOKIDAR_USEPOLLING=true \
    -e WATCHPACK_POLLING=true \
    -v $PWD:/codefree $IMAGE_TAG