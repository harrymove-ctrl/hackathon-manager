#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Running migrations..."
npm run db:migrate

echo "Building..."
npm run build

echo "Starting server..."
npm start
