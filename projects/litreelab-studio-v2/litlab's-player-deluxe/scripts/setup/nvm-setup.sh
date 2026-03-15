#!/bin/bash

# nvm setup script
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Install Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

echo "Node.js version:"
node -v

echo "npm version:"
npm -v