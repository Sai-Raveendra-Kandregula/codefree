#!/bin/sh

VERSION=$(cat ../VERSION)
IMAGE_TAG="codefree:$VERSION"

BUILD_OPTIONS=$@

echo "Building $IMAGE_TAG..."

docker build $BUILD_OPTIONS --network=host -f ./Dockerfile .. -t $IMAGE_TAG