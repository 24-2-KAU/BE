FROM node:16

WORKDIR /node_ex

RUN npm install

CMD ["node", "app.js"]
