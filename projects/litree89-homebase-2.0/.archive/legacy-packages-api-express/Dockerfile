FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]
