FROM node:8.10.0-alpine

LABEL author="phamtinh"

WORKDIR /app

RUN npm install yarn -g
RUN npm install pm2 -g
RUN npm install typescript -g

# Install NPM
COPY package.json /app/
RUN yarn install

#Copy source
COPY . /app/

CMD [ "yarn", "start" ]