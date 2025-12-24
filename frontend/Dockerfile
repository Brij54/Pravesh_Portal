# Use a recent LTS version of node
FROM node:22

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# # Build the react app
# RUN npm run build

# Serve the build folder on port 3000
# CMD ["npx", "serve", "-s", "build", "-l", "3000"]
CMD ["npm", "run", "dev"]
