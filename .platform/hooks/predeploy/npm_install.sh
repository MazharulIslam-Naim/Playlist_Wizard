#!/bin/bash

npm install --omit=dev

npm run build

cd backend
npm install
