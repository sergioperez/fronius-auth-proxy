# Use the official Node.js image as the build environment
FROM node:18 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Build your application (if needed)
# RUN npm run build

# Use the Distroless Node.js image as the final base image
FROM gcr.io/distroless/nodejs:18

# Set the working directory in the Distroless image
WORKDIR /app

# Copy the application code and dependencies from the build stage
COPY --from=build /app .

# Start the application
CMD ["proxy.js"]
