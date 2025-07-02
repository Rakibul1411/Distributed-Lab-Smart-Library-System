FROM node:18-slim

WORKDIR /loan

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8083

CMD ["node", "app/app.js"]
