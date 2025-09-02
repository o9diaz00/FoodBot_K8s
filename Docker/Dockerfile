FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
RUN apk --no-cache add curl
COPY . .
CMD ["node", "index.js"]