# syntax=docker/dockerfile:1

# Stage 1: install all dependencies (including dev deps for TypeScript build)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: compile TypeScript to dist/
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: lightweight runtime image (production deps only)
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies for smaller/faster image
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

# Optional: ensure upload folder exists inside container
RUN mkdir -p uploads

# App listens on port 5000 by default
EXPOSE 5000

# Start compiled server
CMD ["npm", "start"]
