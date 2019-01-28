FROM node:8.11.3

# Install app dependencies 
##  COPY src/package.json /tmp/package.json

# Trigger NPM install. Note that image cache will not be used in the event
# a change is made to the package.json file.
##  RUN cd /tmp && npm install

# Create placeholder directory for application source deposit
RUN mkdir -p /usr/src/app

# Bundle app source. 
# Note that anything below this line will not use the Docker image cache
# if the application source has been modified since the last build.
WORKDIR /usr/src/app
COPY src/ /usr/src/app
##  RUN cp -a /tmp/node_modules /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]
