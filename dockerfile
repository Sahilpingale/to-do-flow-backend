# Use Node.js LTS version
FROM node:20-slim

# Install OpenSSL library
RUN apt-get update && apt-get install -y openssl

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Copy prisma schema
COPY prisma ./prisma/

# Build TypeScript code
RUN npm run build

# Expose port (if your app will listen on a port)
EXPOSE 9000

# Run the application (using dev script for development)
CMD [ "npm", "run", "dev" ]