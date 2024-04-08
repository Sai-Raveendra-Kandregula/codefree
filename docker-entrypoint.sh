#!/bin/sh

cd /codefree/gui/frontend
npm install
npm run build

cd /codefree/gui
python3 main.py