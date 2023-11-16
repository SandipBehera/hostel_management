# Use the official Node.js image
FROM node:18.3.0-alpine3.14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port on which your Node.js application will run
EXPOSE 3000

# Command to run your Node.js application
CMD ["npm", "start"]
