FROM ghcr.io/solaris-games/solaris-base-prod AS build

FROM nginx:1.29-alpine as client

RUN addgroup -S nginxgroup && adduser -S nginxuser -G nginxgroup

RUN rm /etc/nginx/conf.d/default.conf

COPY docker/prod/client/solaris.conf /etc/nginx/conf.d/default.conf

COPY --from=build /solaris/client/dist /usr/share/nginx/html

RUN chown -R nginxuser:nginxgroup \
    /usr/share/nginx/html \
    /var/cache/nginx \
    /var/run \
    /var/log/nginx

USER nginxuser

EXPOSE 8080
