FROM node:16

WORKDIR /node_ex

COPY . .

RUN npm install

CMD ["node", "app.js"]
