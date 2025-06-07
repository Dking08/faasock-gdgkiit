# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port (the one your server listens on)
EXPOSE 8080
EXPOSE 3000

# Run the server
CMD ["npm", "start"]

