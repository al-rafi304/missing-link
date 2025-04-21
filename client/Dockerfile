FROM node:23-alpine

WORKDIR /app

COPY ./client/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client application code# This primes the image, but runtime mounts will be used for development
COPY ./client/ /app

EXPOSE 8080

# Command to run the React development server
CMD ["npm", "start"]