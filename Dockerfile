# First image to compile typescript to javascript
FROM node:20-alpine3.23 AS build-image
USER node
WORKDIR /app
COPY . .
RUN npm ci && npm run build && npm run test

# Second image, that creates an image for production
FROM node:20-alpine3.23 AS prod-image
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3 
# Every image vulnerability finding sits in npm's own bundled tree (tar, glob, minimatch, pacote);
# the base ships npm 10.8.2. Pinned rather than @latest so builds stay reproducible, and 11.x is the
# ceiling while we are on node 20 -- npm 12 requires node 22 or newer.
RUN npm install -g npm@11.19.1
USER node
WORKDIR /app
COPY --from=build-image ./app/dist ./dist
COPY package* ./
COPY migrations ./migrations
COPY migrateUpWithWrapper.mjs ./migrateUpWithWrapper.mjs
# --omit=optional drops chromedriver, an unused optional dependency of keycloak-connect that
# pulls in a large subtree (axios, proxy-agent, basic-ftp) this API never loads.
RUN npm ci --omit=dev --omit=optional
ENV NODE_ENV=production
CMD [ "npm", "run", "start:prd" ]