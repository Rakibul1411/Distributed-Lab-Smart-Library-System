FROM node:18-slim

WORKDIR /book

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8082

CMD ["node", "app/app.js"]
