FROM node:22-slim

RUN mkdir /solaris

WORKDIR /solaris

ADD package.json package.json
ADD package-lock.json package-lock.json
ADD client/ client/
ADD common/ common/
ADD server/ server/

RUN rm -f client/.env
RUN rm -f server/.env

RUN npm install
RUN npm run build
