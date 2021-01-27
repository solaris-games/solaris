FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# To build code for production
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000
RUN npm run start-jobs
CMD [ "npm", "run", "start-api" ]