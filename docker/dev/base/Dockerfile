FROM node:24-slim

RUN mkdir /solaris

WORKDIR /solaris

ADD package.json package.json
ADD package-lock.json package-lock.json
ADD client/ client/
ADD map-rendering/ map-rendering/
ADD common/ common/
ADD server/ server/

RUN rm -f server/.env

RUN npm install
RUN npm run build
