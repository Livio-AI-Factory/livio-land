#!/bin/bash
# Double-click this file to push your Livio Land code to GitHub.
# Repo: https://github.com/ethansargent4/livio-land

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")" || exit 1

echo ""
echo "================================================"
echo "  Livio Land — push to GitHub"
echo "================================================"
echo ""
echo "Repo: https://github.com/ethansargent4/livio-land"
echo "Folder: $(pwd)"
echo ""

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git is not installed. Install from https://git-scm.com or via Xcode CLT."
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi

# Switch schema to Postgres for production deploy
if grep -q 'provider = "sqlite"' prisma/schema.prisma 2>/dev/null; then
  echo "→ Switching Prisma to Postgres for production deploy..."
  sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
  rm -f prisma/schema.prisma.bak
fi

# Init repo if not already
if [ ! -d .git ]; then
  echo "→ git init"
  git init
  git branch -M main
fi

# Make sure dev.db is gitignored so we don't push the SQLite file
if ! grep -q '\*.db' .gitignore 2>/dev/null; then
  echo '*.db' >> .gitignore
fi

echo "→ git add ."
git add .

echo "→ git commit"
if git diff --cached --quiet; then
  echo "  (nothing to commit — already up to date)"
else
  git commit -m "Initial commit: Livio Land marketplace"
fi

# Set remote if not set
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "→ adding remote origin"
  git remote add origin https://github.com/ethansargent4/livio-land.git
fi

echo ""
echo "→ git push -u origin main"
echo "  (if this prompts for a password, GitHub now requires a Personal Access Token —"
echo "   create one at https://github.com/settings/tokens with 'repo' scope, then paste it as the password)"
echo ""

git push -u origin main

PUSH_STATUS=$?
echo ""
if [ $PUSH_STATUS -eq 0 ]; then
  echo "✓ Push complete!"
  echo "  View your repo: https://github.com/ethansargent4/livio-land"
  echo ""
  echo "Next: tell Claude 'pushed' and we'll deploy on Railway."
else
  echo "✗ Push failed (exit $PUSH_STATUS). Common fixes:"
  echo "   - You'll need a GitHub Personal Access Token if prompted for a password."
  echo "   - Generate one: https://github.com/settings/tokens (give it 'repo' scope)"
  echo "   - Use the token as your password when git asks."
fi
echo ""
read -n 1 -s -r -p "Press any key to close..."
