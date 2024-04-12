#!/bin/sh

VERSION=$(cat VERSION)
IMAGE_TAG="codefree:$VERSION"

echo "Running codefree v$VERSION..."

docker run --rm -p 8080:8080 -it $IMAGE_TAG