FROM node:16

WORKDIR /node_ex

COPY ./app .

RUN npm install

CMD ["node", "app.js"]
