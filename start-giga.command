#!/bin/bash
# Double-click this file to install Livio Land and start the dev server.

# Make sure node/npm are findable when launched from Finder
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls -1 $HOME/.nvm/versions/node 2>/dev/null | tail -n1)/bin:$PATH"

cd "$(dirname "$0")" || exit 1

echo ""
echo "================================================"
echo "  Livio Land — local preview"
echo "================================================"
echo ""
echo "→ Project folder: $(pwd)"
echo "→ Node:  $(command -v node || echo 'NOT FOUND')"
echo "→ npm:   $(command -v npm  || echo 'NOT FOUND')"
echo ""

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm wasn't found on your PATH."
  echo "Install Node.js from https://nodejs.org (LTS), then re-run this script."
  echo ""
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi

echo "Step 1/3 — installing dependencies (this can take 1–2 minutes the first time)..."
npm install || { echo "npm install failed"; read -n 1 -s -r -p "Press any key..."; exit 1; }

echo ""
echo "Step 2/3 — creating database and seeding sample listings..."
npm run setup || { echo "setup failed"; read -n 1 -s -r -p "Press any key..."; exit 1; }

echo ""
echo "Step 3/3 — starting dev server. Once you see 'Local: http://localhost:3000', the site is up."
echo "Leave this Terminal window open. Close it (or press Ctrl+C) to stop the server."
echo ""

npm run dev
