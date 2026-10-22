# First image to compile typescript to javascript
FROM node:24-alpine AS build-image
USER node
WORKDIR /app
COPY . .
RUN npm ci && npm run build && npm run test

# Second image, that creates an image for production
FROM node:24-alpine AS prod-image
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3
# Every image vulnerability finding sits in npm's own bundled tree (brace-expansion, undici,
# http-cache-semantics); the base ships npm 11.19.1. Pinned rather than @latest so builds stay reproducible.
RUN npm install -g npm@12.2.1
USER node
WORKDIR /app
COPY --from=build-image ./app/dist ./dist
COPY package* ./
COPY migrations ./migrations
# --omit=optional drops chromedriver, an unused optional dependency of keycloak-connect that
# pulls in a large subtree (axios, proxy-agent, basic-ftp) this API never loads.
RUN npm ci --omit=dev --omit=optional
ENV NODE_ENV=production
CMD [ "npm", "run", "start:prd" ]