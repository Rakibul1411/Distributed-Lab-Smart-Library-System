FROM node:18-slim

WORKDIR /user

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8081

CMD ["node", "app/app.js"]
