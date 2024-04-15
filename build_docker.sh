#!/bin/sh

VERSION=$(cat VERSION)
IMAGE_TAG="codefree:$VERSION"

echo "Building $IMAGE_TAG..."

docker build --network=host ./ -t $IMAGE_TAG