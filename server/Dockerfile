FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN cat .env_override_docker >> .env

RUN npm run build