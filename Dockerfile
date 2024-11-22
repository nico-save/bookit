FROM  node:20.18.0-alpine AS base

WORKDIR /src

COPY package*.json .

RUN npm install  --legacy-peer-deps

COPY . .

RUN npm run build

CMD ["npm", "start"]