# syntax=docker/dockerfile:1.4
ARG APP_VERSION=latest
ARG HARBOR_HOST=10.255.85.20:81
ARG HARBOR_PATH=${HARBOR_HOST}/zds.com

FROM ${HARBOR_PATH}/nginx-brotli:v1.28.0
ENV APP_VERSION=${APP_VERSION}

ARG APP_VERSION=latest
# 如果没有前缀可以兼容
ENV APP_VERSION=/${APP_VERSION}
ENV PORT=3000
COPY /docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i "s|/dev|${APP_VERSION}|g" /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY /build /usr/share/nginx/html${APP_VERSION}/