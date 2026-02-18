FROM node:22-slim

WORKDIR /app

# Initialize project and install dependencies
RUN npm init -y && npm install express cors

# Copy the server script
COPY server.js .

# Expose the port
EXPOSE 8000

# Start the bridge server
CMD ["node", "server.js"]
