# First image to compile typescript to javascript
FROM node:20-alpine3.23 AS build-image
USER node
WORKDIR /app
COPY . .
RUN npm ci && npm run build && npm run test

# Second image, that creates an image for production
FROM node:20-alpine3.23 AS prod-image
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3 
USER node
WORKDIR /app
COPY --from=build-image ./app/dist ./dist
COPY package* ./
COPY migrations ./migrations
COPY migrateUpWithWrapper.mjs ./migrateUpWithWrapper.mjs
RUN npm ci --omit=dev
ENV NODE_ENV=production
CMD [ "npm", "run", "start:prd" ]