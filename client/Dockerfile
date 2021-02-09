FROM node:14

# install simple http server for serving static content
RUN npm install -g http-server

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci

# Bundle app source
COPY . .

# build app for production with minification
RUN npm run build

EXPOSE 8080
CMD [ "http-server", "dist" ]