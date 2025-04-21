FROM node:23-alpine

WORKDIR /app

RUN npm install -g truffle

# Copy these first to leverage Docker cache for dependencies
COPY ./truffle/package*.json ./

# # If you have truffle-specific node dependencies (e.g., @openzeppelin/contracts) install them
# RUN npm install

# Copy the rest of the Truffle project files into the container
COPY ./truffle/ /app

# The main command will be overridden in docker-compose.yml
# This default command keeps the container alive if run independently.
CMD ["tail", "-f", "/dev/null"]