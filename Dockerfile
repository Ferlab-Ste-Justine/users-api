# First image to compile typescript to javascript
FROM node:20-alpine3.18 AS build-image
WORKDIR /app
COPY . .
RUN npm ci && npm run build && npm run test

# Second image, that creates an image for production
FROM node:20-alpine3.18 AS prod-image
WORKDIR /app
COPY --from=build-image ./app/dist ./dist
COPY package* ./
COPY migrations ./migrations
COPY migrateUpWithWrapper.mjs ./migrateUpWithWrapper.mjs
RUN npm ci --omit=dev
ENV NODE_ENV=production
CMD [ "npm", "run", "start:prd" ]
