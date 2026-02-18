# Use Node.js 22 (Recommended by Cline docs)
FROM node:22-slim

# Install system dependencies (git is often needed by cline tools)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Install cline-cli globally
RUN npm install -g cline

# Create a working directory
WORKDIR /app

# Create a dummy server file to satisfy Koyeb's Web Service requirement
# This listens on port 8000 so Koyeb thinks the app is "healthy"
RUN echo 'const http = require("http"); \
const server = http.createServer((req, res) => { \
  res.writeHead(200); \
  res.end("Cline is sleeping... Wake me up in the Console tab!"); \
}); \
server.listen(8000, "0.0.0.0", () => console.log("Dummy server running on port 8000"));' > server.js

# Expose the port
EXPOSE 8000

# Start the dummy server
CMD ["node", "server.js"]
