FROM nginx:1.27.4-alpine AS base
# Install curl for the healthcheck
RUN apk add --no-cache curl
# Copy files into the image
COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/ /etc/nginx/certs/
