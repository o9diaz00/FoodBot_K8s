FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
RUN apt-get update && apt-get install -y curl grep && apt-get clean
COPY . .
CMD ["node", "index.js"]