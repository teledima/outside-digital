FROM node:17
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY app.js .
COPY ./src ./src
EXPOSE 8080
CMD ["npm", "run", "prod"]
