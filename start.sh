#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing database schema & seeding..."
npx prisma db push --accept-data-loss
npm run seed

echo "Building..."
npm run build

echo "Starting server..."
npm start
