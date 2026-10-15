FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY server/package.json ./server/
COPY prisma ./prisma
RUN npm install
COPY server ./server
COPY prisma ./prisma
WORKDIR /app/server
RUN npx prisma generate
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
