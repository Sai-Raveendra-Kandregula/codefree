#! /usr/bin/env bash

if [ ${ENVIRONMENT^^} = "DEV" ]; then
    yarn --cwd /codefree_ui start
else
    yarn --cwd /codefree_ui build
    a2ensite 000-default
    apache2ctl -D FOREGROUND
fi