# Use official Playwright image with browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.44.1-jammy

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Optional: expose a port (only if you run a web server)
# EXPOSE 3000

# Set command to run your app
CMD ["node", "index.mjs"]