# Use Node.js 22
FROM node:22-slim

# Install system basics
RUN apt-get update && apt-get install -y git curl && rm -rf /var/lib/apt/lists/*

# Install cline globally (agar aapko console mein use karna hai)
RUN npm install -g cline

# Working directory
WORKDIR /app

# Initialize package.json aur dependencies install karein
# Hum yahan seedha commands chala rahe hain taaki aapko alag file na upload karni pade
RUN npm init -y && \
    npm install express cors

# Copy server.js from your repo to the container
COPY server.js .

# Expose port 8000
EXPOSE 8000

# Start the REAL server
CMD ["node", "server.js"]
