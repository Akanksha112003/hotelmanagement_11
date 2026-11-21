# ---- build stage ----
# Use a lightweight Node.js Alpine image as the base for building the frontend.
FROM node:22-alpine AS build
# Set /app as the working directory for all subsequent build instructions.
WORKDIR /app

# Copy package manifests first so npm dependencies can be cached separately.
COPY package*.json ./
# Install exactly the dependencies from package-lock.json.
RUN npm ci

# Copy the remaining frontend source code into the image.
COPY . .

# Relative URL so the browser calls nginx, which proxies to the backend
# Declare a build-time variable for the API base URL.
ARG VITE_API_URL=/api
# Expose the build argument as an environment variable used by Vite.
ENV VITE_API_URL=$VITE_API_URL
# Compile and bundle the React application for production.
RUN npm run build

# ---- serve stage ----
# Use a lightweight nginx Alpine image to serve the built frontend.
FROM nginx:alpine
# Copy the custom nginx server configuration into the image.
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the compiled frontend files from the build stage.
COPY --from=build /app/dist /usr/share/nginx/html
# Document that nginx listens on TCP port 80 in the container.
EXPOSE 80
# Start nginx in the foreground so the container remains running.
CMD ["nginx", "-g", "daemon off;"]
