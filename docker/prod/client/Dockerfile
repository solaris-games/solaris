FROM ghcr.io/solaris-games/solaris-command-base-prod AS build

FROM nginx:1.29-alpine as client

RUN rm /etc/nginx/conf.d/default.conf

COPY docker/prod/client/solaris.conf /etc/nginx/conf.d/solaris.conf

COPY --from=build /solaris/client/dist /usr/share/nginx/html

EXPOSE 8080
