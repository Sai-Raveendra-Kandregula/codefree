#!/bin/sh

VERSION=$(cat ../VERSION)
IMAGE_TAG="codefree:$VERSION"

OPTIONS=$@

docker run --rm $OPTIONS -p 8080:8080 -it $IMAGE_TAG