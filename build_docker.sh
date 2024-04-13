#!/bin/sh

VERSION=$(cat VERSION)
IMAGE_TAG="codefree:$VERSION"

echo "Building $IMAGE_TAG..."

docker build --no-cache --network=host ./ -t $IMAGE_TAG