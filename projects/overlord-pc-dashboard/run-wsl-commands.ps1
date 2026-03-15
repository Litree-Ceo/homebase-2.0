# PowerShell script to execute WSL commands
# This will run the nvm setup in WSL

# Run nvm setup in WSL
wsl -d Ubuntu-24.04 -- bash -c "
  export NVM_DIR=\"$HOME/.nvm\" && 
  [ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\" && 
  nvm install 18 && 
  nvm use 18 && 
  nvm alias default 18 && 
  echo 'Node.js version:' && node -v && 
  echo 'npm version:' && npm -v
"

# Run setup.sh in WSL
wsl -d Ubuntu-24.04 -- bash -c "
  cd /mnt/c/Users/litre/Desktop/Overlord-Pc-Dashboard && 
  export NVM_DIR=\"$HOME/.nvm\" && 
  [ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\" && 
  ./setup.sh
"

# Fix Tailwind CSS
wsl -d Ubuntu-24.04 -- bash -c "
  cd /mnt/c/Users/litre/Desktop/Overlord-Pc-Dashboard/_Archive/System-Overlord-Phase0/web && 
  npm install daisyui
"

pause