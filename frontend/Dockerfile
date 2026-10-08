FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Run expo for web
CMD ["npm", "run", "web"]
