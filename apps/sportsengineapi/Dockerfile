FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy root workspace configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy packages
COPY packages ./packages

# Copy the specific app
COPY apps/sportsengineapi ./apps/sportsengineapi

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
WORKDIR /app/apps/sportsengineapi
RUN pnpm build

# Start
CMD ["pnpm", "start"]
