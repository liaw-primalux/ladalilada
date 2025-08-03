# Stage 1: Base build image
FROM node:20-alpine AS builder

WORKDIR /app

# Install global Angular CLI
RUN npm install -g @angular/cli@19

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Stage 2: Development image with file watching
FROM node:20-alpine

WORKDIR /app

# Install global Angular CLI
RUN npm install -g @angular/cli@19

# Install chokidar for file watching support
RUN npm install -g chokidar-cli

# Install dependencies (will be mounted during dev)
COPY package*.json ./
RUN npm install

# Copy the Angular project
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Enable file watching via chokidar
CMD ["sh", "-c", "ng serve --host 0.0.0.0 --poll=1000"]
