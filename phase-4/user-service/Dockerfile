FROM node:18-slim

# Set working directory inside container
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy rest of the source code
COPY . .

EXPOSE 8081

CMD ["node", "app/app.js"]
