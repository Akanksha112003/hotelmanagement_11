# Use a lightweight Node.js Alpine image for the production backend.
FROM node:22-alpine
# Set /app as the working directory for all subsequent instructions.
WORKDIR /app

# Copy package manifests first to support Docker layer caching.
COPY package*.json ./
# Install only production dependencies, excluding development dependencies.
RUN npm ci --omit=dev

# Copy the backend source code and application files into the image.
COPY . .

# Mark the application environment as production.
ENV NODE_ENV=production
# Document that the backend listens on TCP port 5001.
EXPOSE 5001
# Run the application as the unprivileged node user for improved security.
USER node
# Start the backend application using Node.js.
CMD ["node", "index.js"]
