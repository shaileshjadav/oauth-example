FROM node:20-alpine3.18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 9020 

CMD node app.js