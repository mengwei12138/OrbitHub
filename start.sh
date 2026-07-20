#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
REQUIRED_NODE_MAJOR="20"
REQUIRED_NODE_VERSION="20.19.3"
REGISTRY_URL="https://registry.npmjs.org"
NVM_NODE_BIN="$HOME/.nvm/versions/node/v$REQUIRED_NODE_VERSION/bin"

cd "$ROOT_DIR"

if [ -d "$NVM_NODE_BIN" ]; then
  export PATH="$NVM_NODE_BIN:$PATH"
fi

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # Prefer a Node version that satisfies Vite 8 requirements.
  # shellcheck disable=SC1090
  . "$HOME/.nvm/nvm.sh"
  nvm use "$REQUIRED_NODE_VERSION" >/dev/null 2>&1 \
    || nvm use "$REQUIRED_NODE_MAJOR" >/dev/null 2>&1 \
    || true
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found. Please install Node.js first."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found. Please install Node.js and npm first."
  exit 1
fi

NODE_VERSION="$(node -p 'process.versions.node')"
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
NODE_MINOR="$(node -p "process.versions.node.split('.')[1]")"

if [ "$NODE_MAJOR" -lt 20 ] || { [ "$NODE_MAJOR" -eq 20 ] && [ "$NODE_MINOR" -lt 19 ]; }; then
  echo "Current Node.js version is $NODE_VERSION, which does not satisfy Vite 8."
  echo "Please use Node.js 20.19+ or 22.12+."
  echo "If you use nvm, run: nvm use 20"
  exit 1
fi

if [ ! -e node_modules ]; then
  echo "node_modules not found. Installing dependencies..."
  npm install --legacy-peer-deps --registry="$REGISTRY_URL"
fi

echo "Starting MatrixHub UI Review Prototype..."
exec npm run dev
