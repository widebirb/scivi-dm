# Stage 1 - Builder
# We use node:18-alpine as a lightweight Node image just to build the app.
# This stage exists only to produce the /app/dist folder — it won't be in the final image.
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first so Docker can cache the npm install layer.
# If your package.json doesn't change, this layer is reused on every rebuild.
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# VITE_API_URL is a build argument — Vite bakes env vars into the static
# bundle at build time, not at runtime. If you change the API URL later
# you need to rebuild this image with the new ARG value.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Produces the /app/dist folder with all static files
RUN npm run build

# Stage 2 - Final image
# Throw away everything from the builder stage except /app/dist.
# nginx:alpine is ~25MB vs ~1GB if we kept node_modules in.
FROM nginx:alpine

# Copy only the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Our custom nginx config needed for React client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]