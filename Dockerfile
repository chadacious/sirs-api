FROM node:8.12.0 as builder
ARG NPM_TOKEN

WORKDIR /app
# Use a multi-stage build docker file to first create an environment to build 
# the react application. Note that only the last FROM will create the final docker image
COPY package.json README.md LICENSE .babelrc ./

RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && \
    npm i -S npm-run-all && \
    npm install
COPY /scripts scripts
COPY /src src
RUN dir
RUN  npm run build

# Create the environment for the deployable image now that it has been build in the builder
# transient image
FROM node:8.12.0

WORKDIR /app
COPY --from=builder /app/dist .
COPY --from=builder /app/node_modules ./node_modules
COPY .env.production .
ENV NODE_ENV production
# ENV FORCE_DB_SYNC 1
# RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && \
#     npm install

USER node
CMD node index.js