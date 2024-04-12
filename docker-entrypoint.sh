#!/bin/sh

cd /codefree/gui/frontend
npm install
npm run build
cp -rf build /var/www/html

cd /codefree/gui
python3 main.py