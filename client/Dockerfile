FROM node:20-alpine as builder
WORKDIR /app
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm install
COPY . .
RUN npm run build --workspace=client

FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
