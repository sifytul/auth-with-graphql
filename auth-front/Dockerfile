FROM node:18-alpine

WORKDIR /home/app
COPY package*.json .

RUN npm i

COPY . .

CMD [ "npm", "run", "dev"]